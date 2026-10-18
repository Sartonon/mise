// CI's pull request report: `node scripts/lighthouse/comment.ts <summary.json> [reports url]`
// prints the results that `pnpm lighthouse` saved as Markdown.
import { readFile } from 'node:fs/promises'
import { markdownReport, type PageResult } from './report.ts'

const [summaryFile, reportsUrl] = process.argv.slice(2)
if (!summaryFile) {
  console.error('Usage: comment.ts <summary.json> [reports url]')
  process.exit(1)
}

const summary = JSON.parse(await readFile(summaryFile, 'utf8')) as {
  pages: PageResult[]
  runs: number
  lighthouseVersion: string
}
console.log(markdownReport({ ...summary, reportsUrl }))
