// `pnpm size`: how big the last build (`pnpm build`) is, and whether it fits the budget.
// CI passes the folder of a build it downloaded instead.
import { existsSync } from 'node:fs'
import { budget } from './budget.ts'
import { measureDir } from './measure.ts'
import { overBudget, textReport } from './report.ts'

const dir = process.argv[2] ?? '.output/public'
const assets = existsSync(dir) ? await measureDir(dir) : []
if (assets.length === 0) {
  console.error(`No .js or .css files in ${dir}. Run \`pnpm build\` first.`)
  process.exit(1)
}

console.log(textReport(assets, budget))

const over = overBudget(assets, budget)
if (over.length > 0) {
  console.error(`\nOver budget: ${over.join(', ')}. See scripts/bundle-size/budget.ts.`)
  process.exitCode = 1
}
