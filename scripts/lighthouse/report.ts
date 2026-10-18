// The four scores Lighthouse gives a page, from 0 to 1 (the report shows them out of 100).
const categories = ['performance', 'accessibility', 'best-practices', 'seo'] as const
type Category = (typeof categories)[number]
const categoryLabel: Record<Category, string> = {
  performance: 'Performance',
  accessibility: 'Accessibility',
  'best-practices': 'Best practices',
  seo: 'SEO',
}

// The five measurements the performance score is made of (Lighthouse 10 and later).
const metrics = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
] as const
type Metric = (typeof metrics)[number]
const metricLabel: Record<Metric, string> = {
  'first-contentful-paint': 'First Contentful Paint',
  'largest-contentful-paint': 'Largest Contentful Paint',
  'total-blocking-time': 'Total Blocking Time',
  'cumulative-layout-shift': 'Cumulative Layout Shift',
  'speed-index': 'Speed Index',
}

// Only the parts of a Lighthouse result (its "LHR") that we read. A real result from the
// `lighthouse` package fits this type, and so does a small one written by hand in a test.
// A score is null when Lighthouse couldn't work it out, for example when the page failed to load.
export type LighthouseResult = {
  categories: Partial<Record<string, { score: number | null }>>
  audits: Partial<Record<string, { score: number | null; displayValue?: string }>>
}

// One page's result, small enough to save as JSON and hand from one CI job to the next.
export type PageResult = {
  path: string
  scores: Record<Category, number | null>
  metrics: Record<Metric, { score: number | null; value: string }>
}

export function summarize(path: string, lhr: LighthouseResult): PageResult {
  return {
    path,
    scores: Object.fromEntries(
      categories.map((id) => [id, lhr.categories[id]?.score ?? null]),
    ) as PageResult['scores'],
    metrics: Object.fromEntries(
      metrics.map((id) => {
        const audit = lhr.audits[id]
        return [id, { score: audit?.score ?? null, value: audit?.displayValue ?? '–' }]
      }),
    ) as PageResult['metrics'],
  }
}

// The report's file name for a page: "/" is "home", "/recipes/42" is "recipes-42".
export function fileName(path: string): string {
  return path.split('/').filter(Boolean).join('-') || 'home'
}

// Lighthouse's own colours: 90 to 100 is good, 50 to 89 needs work, below 50 is poor.
// The number is always shown next to it, so the meaning doesn't rest on the colour alone.
export function rating(score: number | null): string {
  if (score === null) return '⚪'
  if (score >= 0.9) return '🟢'
  if (score >= 0.5) return '🟠'
  return '🔴'
}

function outOf100(score: number | null): string {
  return score === null ? '–' : String(Math.round(score * 100))
}

// For `pnpm lighthouse` in the terminal: one line of scores and one of metrics per page.
export function textReport(pages: PageResult[]): string {
  const width = Math.max(4, ...pages.map((page) => page.path.length))
  const header = ['Page'.padEnd(width), ...categories.map((id) => categoryLabel[id])].join('  ')
  const rows = pages.map((page) =>
    [
      page.path.padEnd(width),
      ...categories.map((id) => outOf100(page.scores[id]).padStart(categoryLabel[id].length)),
    ].join('  '),
  )
  const metricRows = pages.map(
    (page) =>
      `${page.path.padEnd(width)}  ` +
      metrics.map((id) => `${metricLabel[id]} ${page.metrics[id].value}`).join(', '),
  )
  return [header, ...rows, '', ...metricRows].join('\n')
}

// Comments carry this hidden marker, so CI can find and update its own comment
// instead of adding a new one on every push.
export const marker = '<!-- lighthouse-report -->'

type ReportInput = {
  pages: PageResult[]
  runs: number
  lighthouseVersion: string
  reportsUrl?: string
}

// The pull request comment (and the CI run's summary), in GitHub's Markdown.
export function markdownReport({
  pages,
  runs,
  lighthouseVersion,
  reportsUrl,
}: ReportInput): string {
  const cell = (score: number | null) => `${rating(score)} ${outOf100(score)}`
  return [
    marker,
    '## 🔦 Lighthouse',
    '',
    `Each page of this pull request's production build, as a mid-range phone on a slow 4G ` +
      `connection would load it (Lighthouse's mobile defaults): the median of ${runs} runs.`,
    '',
    `| Page | ${categories.map((id) => categoryLabel[id]).join(' | ')} |`,
    `| :-- | ${categories.map(() => '--:').join(' | ')} |`,
    ...pages.map(
      (page) =>
        `| \`${page.path}\` | ${categories.map((id) => cell(page.scores[id])).join(' | ')} |`,
    ),
    '',
    '**Performance metrics**',
    '',
    `| Page | ${metrics.map((id) => metricLabel[id]).join(' | ')} |`,
    `| :-- | ${metrics.map(() => '--:').join(' | ')} |`,
    ...pages.map(
      (page) =>
        `| \`${page.path}\` | ` +
        metrics
          .map((id) => `${rating(page.metrics[id].score)} ${page.metrics[id].value}`)
          .join(' | ') +
        ' |',
    ),
    '',
    '🟢 90–100 good · 🟠 50–89 needs improvement · 🔴 0–49 poor',
    '',
    // CI machines are shared and their speed varies, so the same code can score a few
    // points differently from one run to the next.
    `Scores can move a few points between runs on CI's shared machines, so look for big ` +
      `changes, not small ones. The build is served by \`pnpm start\`, which doesn't ` +
      `compress files as Vercel does, so downloads are bigger here than for real users. ` +
      `Measured with Lighthouse ${lighthouseVersion}.`,
    ...(reportsUrl
      ? [
          '',
          `📄 **Full reports:** [download them](${reportsUrl}), unzip, and open a page's ` +
            `HTML file in a browser to see what to improve.`,
        ]
      : []),
    '',
  ].join('\n')
}
