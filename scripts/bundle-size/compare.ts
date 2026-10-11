// CI's pull request report: `node scripts/bundle-size/compare.ts <base dir> <head dir> [treemap url]`
// measures two builds' `public` folders and prints the comparison as Markdown.
import { budget } from './budget.ts'
import { measureDir } from './measure.ts'
import { markdownReport } from './report.ts'

const [baseDir, headDir, treemapUrl] = process.argv.slice(2)
if (!baseDir || !headDir) {
  console.error('Usage: compare.ts <base dir> <head dir> [treemap url]')
  process.exit(1)
}

const [base, head] = await Promise.all([measureDir(baseDir), measureDir(headDir)])
console.log(
  markdownReport({
    base,
    head,
    budget,
    baseName: process.env.BASE_NAME ?? 'main',
    treemapUrl,
  }),
)
