// Copies the screenshots and videos from the last run of record.config.ts into one folder,
// named after their tests, and converts the videos from WebM to MP4 (phones, iPhones
// above all, often can't play WebM).
// Usage: node .claude/skills/record/collect.ts <output folder>
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'

import { slugify } from '../../../src/lib/slugify.ts'

// The parts of Playwright's JSON report we read.
interface Attachment {
  name: string
  contentType: string
  path?: string
}
interface Spec {
  title: string
  file: string
  tests: { results: { attachments: Attachment[] }[] }[]
}
interface Suite {
  title: string
  specs: Spec[]
  suites?: Suite[]
}

const outDir = process.argv[2]
if (!outDir) {
  throw new Error('Usage: node .claude/skills/record/collect.ts <output folder>')
}
mkdirSync(outDir, { recursive: true })

const reportPath = join(import.meta.dirname, '../../../test-results/record-report.json')
const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { suites: Suite[] }

// Suites nest (a file, then each `test.describe`), so walk them all, keeping their titles.
function* specsIn(suites: Suite[], titles: string[] = []): Generator<[string[], Spec]> {
  for (const suite of suites) {
    // The top suite's title is the file name, which the spec's `file` already gives.
    const inner = suite.title.endsWith('.ts') ? titles : [...titles, suite.title]
    for (const spec of suite.specs) yield [[...inner, spec.title], spec]
    yield* specsIn(suite.suites ?? [], inner)
  }
}

let count = 0
for (const [titles, spec] of specsIn(report.suites)) {
  for (const test of spec.tests) {
    // A retried test has several results; the last one is the one that counts.
    const attachments = test.results.at(-1)?.attachments ?? []
    const file = basename(spec.file).replace(/\.spec\.ts$/, '')
    const name = slugify([String(++count).padStart(2, '0'), file, ...titles].join(' '))

    for (const attachment of attachments) {
      const { path, contentType } = attachment
      if (!path) continue
      if (contentType === 'image/png') {
        // 'screenshot' is the one `screenshot: 'on'` takes at the end. A spec can attach more,
        // and their own names go into the file name.
        const suffix = attachment.name === 'screenshot' ? '' : `-${slugify(attachment.name)}`
        copyFileSync(path, join(outDir, `${name}${suffix}.png`))
      } else if (contentType === 'video/webm') {
        // yuv420p and faststart: the pixel format and layout that every player can stream.
        const mp4 = join(outDir, `${name}.mp4`)
        const options = ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
        execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', path, ...options, mp4])
      }
    }
    // A test that only uses `request` (plain HTTP) never opens a page, so nothing is recorded.
    console.log(
      attachments.some((a) => a.path) ? name : `${name} (no browser page, nothing recorded)`,
    )
  }
}
