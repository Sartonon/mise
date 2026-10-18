// `pnpm lighthouse`: start the last production build (`pnpm build`), audit every page with
// Lighthouse in headless Chrome, and write the reports to lighthouse-report/:
// one HTML report per page, and summary.json, which CI turns into the pull request comment.
// `pnpm lighthouse <url>` audits a site that is already running instead (a Vercel preview, say).
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse, { type Result } from 'lighthouse'
import * as medianRun from 'lighthouse/core/lib/median-run.js'
import { fileName, summarize, textReport } from './report.ts'

// Every page to audit. Add new routes here as they're built.
const pages = ['/', '/about']
// Each page is loaded this many times, and the run in the middle is kept,
// because one run on its own can be unluckily slow or fast.
const runs = 3
const outDir = 'lighthouse-report'
// Not 3000 (your own `pnpm dev`) or 3100 (the e2e tests), so it never audits the wrong server.
const PORT = 3200

// Lighthouse's own pick of the middle run: the one closest to the median first paint and the
// median moment the page is ready to use. Its type file uses a global `LH` type that only
// exists inside Lighthouse's own repo, so TypeScript can't read it; this gives it its type.
const computeMedianRun = medianRun.computeMedianRun as (runs: Result[]) => Result

const server = process.argv[2] ? undefined : await startServer()
const baseUrl = process.argv[2] ?? `http://localhost:${PORT}`

// Chrome won't run as root (as in a Docker container) with its sandbox on.
const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless', ...(process.getuid?.() === 0 ? ['--no-sandbox'] : [])],
})

try {
  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir)

  const results = []
  let lighthouseVersion = ''
  for (const path of pages) {
    const url = new URL(path, baseUrl).href
    const pageRuns = []
    for (let run = 1; run <= runs; run++) {
      console.error(`Lighthouse: ${url} (run ${run} of ${runs})`)
      const result = await lighthouse(url, { port: chrome.port, output: 'html', logLevel: 'error' })
      // For example, the page answered with an error instead of HTML.
      if (result?.lhr.runtimeError) {
        throw new Error(`Lighthouse couldn't audit ${url}: ${result.lhr.runtimeError.message}`)
      }
      if (result) pageRuns.push(result)
    }

    const lhr = computeMedianRun(pageRuns.map((result) => result.lhr))
    const report = pageRuns.find((result) => result.lhr === lhr)?.report
    lighthouseVersion = lhr.lighthouseVersion
    await writeFile(`${outDir}/${fileName(path)}.html`, String(report))
    results.push(summarize(path, lhr))
  }

  await writeFile(
    `${outDir}/summary.json`,
    JSON.stringify({ pages: results, runs, lighthouseVersion }, null, 2),
  )
  console.log(`\n${textReport(results)}\n\nFull reports: ${outDir}/*.html`)
} finally {
  chrome.kill()
  server?.kill()
}

// Run the production server, like `pnpm start`, and wait until it answers.
async function startServer() {
  const entry = '.output/server/index.mjs'
  if (!existsSync(entry)) {
    console.error(`No production build in .output/. Run \`pnpm build\` first.`)
    process.exit(1)
  }
  const child = spawn(process.execPath, [entry], {
    env: { ...process.env, PORT: String(PORT) },
    // Show only the server's errors, not its "Listening on" lines.
    stdio: ['ignore', 'ignore', 'inherit'],
  })
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      await fetch(`http://localhost:${PORT}/`)
      return child
    } catch {
      // Not listening yet.
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
  child.kill()
  throw new Error(`The server didn't start on port ${PORT}`)
}
