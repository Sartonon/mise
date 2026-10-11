import type { Asset } from './measure.ts'

type Kind = Asset['kind']

// The most each kind of file may weigh, compressed, in bytes.
export type Budget = Record<Kind, number>

const kinds: Kind[] = ['js', 'css']
const kindLabel: Record<Kind, string> = { js: 'JavaScript', css: 'CSS' }

// Like Vite's own build output: 1 kB is 1000 bytes. One decimal, but `200 kB`, not `200.0 kB`.
export function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`
  return `${(bytes / 1000).toFixed(1).replace(/\.0$/, '')} kB`
}

// "📈 +1.2 kB (+0.9%)". The arrow and the sign both say which way it went, so the
// meaning doesn't rest on the emoji alone.
export function formatChange(before: number, after: number): string {
  const diff = after - before
  if (diff === 0) return 'no change'
  const sign = diff > 0 ? '+' : '−'
  const icon = diff > 0 ? '📈' : '📉'
  const percent = before === 0 ? 0 : (Math.abs(diff) / before) * 100
  const shown = percent > 0 && percent < 0.1 ? '<0.1' : percent.toFixed(1)
  return `${icon} ${sign}${formatBytes(Math.abs(diff))} (${sign}${shown}%)`
}

// A text progress bar: `bar(0.25, 8)` is "██░░░░░░". Over 1 stays full.
export function bar(fraction: number, width = 20): string {
  const filled = Math.round(Math.min(Math.max(fraction, 0), 1) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

function total(assets: Asset[], kind?: Kind) {
  const picked = kind ? assets.filter((asset) => asset.kind === kind) : assets
  return {
    raw: picked.reduce((sum, asset) => sum + asset.raw, 0),
    compressed: picked.reduce((sum, asset) => sum + asset.compressed, 0),
  }
}

export function overBudget(assets: Asset[], budget: Budget): Kind[] {
  return kinds.filter((kind) => total(assets, kind).compressed > budget[kind])
}

function percent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`
}

function budgetLine(assets: Asset[], budget: Budget, kind: Kind): string {
  const used = total(assets, kind).compressed / budget[kind]
  const status = used > 1 ? '⛔ over budget' : percent(used)
  return `${kindLabel[kind]}: \`${bar(used)}\` ${status} of ${formatBytes(budget[kind])}`
}

// For `pnpm size` in the terminal: every file, the totals and the budget.
export function textReport(assets: Asset[], budget: Budget): string {
  const width = Math.max(10, ...assets.map((asset) => asset.name.length))
  const line = (name: string, raw: string, compressed: string) =>
    `  ${name.padEnd(width)}  ${raw.padStart(9)}  ${compressed.padStart(10)}`
  const rows = assets.map((asset) =>
    line(asset.name, formatBytes(asset.raw), formatBytes(asset.compressed)),
  )
  const totals = kinds.map((kind) => {
    const { raw, compressed } = total(assets, kind)
    return line(kindLabel[kind], formatBytes(raw), formatBytes(compressed))
  })
  const budgets = kinds.map((kind) => `  ${budgetLine(assets, budget, kind).replaceAll('`', '')}`)
  return [
    line('File', 'Raw', 'Compressed'),
    ...rows,
    '',
    ...totals,
    '',
    'Budget (compressed):',
    ...budgets,
  ].join('\n')
}

// Comments carry this hidden marker, so CI can find and update its own comment
// instead of adding a new one on every push.
export const marker = '<!-- bundle-size-report -->'

type ReportInput = {
  base: Asset[]
  head: Asset[]
  budget: Budget
  baseName: string
  treemapUrl?: string
}

// The pull request comment (and the CI run's summary), in GitHub's Markdown.
export function markdownReport({ base, head, budget, baseName, treemapUrl }: ReportInput): string {
  const before = total(base)
  const after = total(head)
  const diff = after.compressed - before.compressed
  const headline =
    diff === 0
      ? `**No change** to what the browser downloads, compared with \`${baseName}\`.`
      : `**This pull request ${diff > 0 ? 'adds' : 'saves'} ${formatBytes(Math.abs(diff))}** ` +
        `of what the browser downloads, compared with \`${baseName}\`.`

  const totalRows = kinds.map((kind) => {
    const b = total(base, kind).compressed
    const h = total(head, kind).compressed
    return `| ${kindLabel[kind]} | ${formatBytes(b)} | ${formatBytes(h)} | ${formatChange(b, h)} |`
  })

  // Every file in either build, matched by name: biggest first, removed files last.
  const names = [...new Set([...head, ...base].map((asset) => asset.name))]
  const changed = names.filter((name) => {
    const b = base.find((asset) => asset.name === name)
    const h = head.find((asset) => asset.name === name)
    return b?.compressed !== h?.compressed
  })
  const fileRows = names.map((name) => {
    const b = base.find((asset) => asset.name === name)
    const h = head.find((asset) => asset.name === name)
    const change = !b ? '🆕 new' : !h ? '🗑️ removed' : formatChange(b.compressed, h.compressed)
    const share = h
      ? `\`${bar(h.compressed / after.compressed, 10)}\` ${percent(h.compressed / after.compressed)}`
      : ''
    return `| \`${name}\` | ${b ? formatBytes(b.compressed) : '–'} | ${h ? formatBytes(h.compressed) : '–'} | ${change} | ${share} |`
  })

  const over = overBudget(head, budget)
  return [
    marker,
    '## 📦 Bundle size',
    '',
    headline,
    ...(over.length > 0
      ? [
          '',
          `> [!CAUTION]`,
          `> ${over.map((kind) => kindLabel[kind]).join(' and ')} is over budget.`,
        ]
      : []),
    '',
    `| | \`${baseName}\` | This PR | Change |`,
    '| :-- | --: | --: | :-- |',
    ...totalRows,
    `| **Total** | **${formatBytes(before.compressed)}** | **${formatBytes(after.compressed)}** | **${formatChange(before.compressed, after.compressed)}** |`,
    '',
    `Sizes are compressed with Brotli, as Vercel sends them. Uncompressed, the browser has ` +
      `${formatBytes(after.raw)} to parse (${formatChange(before.raw, after.raw)}).`,
    '',
    '**Budget**',
    '',
    ...kinds.map((kind) => `- ${budgetLine(head, budget, kind)}`),
    '',
    '<details>',
    `<summary>Files: ${names.length}, changed: ${changed.length}</summary>`,
    '',
    `| File | \`${baseName}\` | This PR | Change | Share |`,
    '| :-- | --: | --: | :-- | :-- |',
    ...fileRows,
    '',
    '</details>',
    ...(treemapUrl
      ? [
          '',
          `🗺️ **What's inside:** [download the treemap](${treemapUrl}) and open it in a browser.`,
        ]
      : []),
    '',
  ].join('\n')
}
