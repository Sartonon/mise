import { describe, expect, test } from 'vitest'
import {
  fileName,
  marker,
  markdownReport,
  rating,
  summarize,
  textReport,
  type LighthouseResult,
  type PageResult,
} from './report.ts'

// Only the parts of a Lighthouse result the report reads. A real one has far more.
function lhr(performance: number | null, lcp = '2.1 s'): LighthouseResult {
  return {
    categories: {
      performance: { score: performance },
      accessibility: { score: 1 },
      'best-practices': { score: 0.96 },
      seo: { score: 0.82 },
    },
    audits: {
      'first-contentful-paint': { score: 0.99, displayValue: '0.9 s' },
      'largest-contentful-paint': { score: 0.42, displayValue: lcp },
      'total-blocking-time': { score: 1, displayValue: '0 ms' },
      'cumulative-layout-shift': { score: 1, displayValue: '0' },
      'speed-index': { score: 0.95, displayValue: '1.1 s' },
    },
  }
}

describe('fileName', () => {
  test('names the report after the page', () => {
    expect(fileName('/')).toBe('home')
    expect(fileName('/about')).toBe('about')
    expect(fileName('/recipes/42')).toBe('recipes-42')
  })
})

describe('rating', () => {
  test("uses Lighthouse's own colours: 90 and up is good, under 50 is poor", () => {
    expect(rating(0.9)).toBe('🟢')
    expect(rating(0.89)).toBe('🟠')
    expect(rating(0.5)).toBe('🟠')
    expect(rating(0.49)).toBe('🔴')
    expect(rating(null)).toBe('⚪')
  })
})

describe('summarize', () => {
  test('keeps the scores, out of 100, and the metrics as Lighthouse shows them', () => {
    const page = summarize('/', lhr(0.976))

    expect(page.path).toBe('/')
    expect(page.scores).toEqual({
      performance: 0.976,
      accessibility: 1,
      'best-practices': 0.96,
      seo: 0.82,
    })
    expect(page.metrics['largest-contentful-paint']).toEqual({ score: 0.42, value: '2.1 s' })
  })

  test('keeps a missing score as null, so the report can say so', () => {
    expect(summarize('/', lhr(null)).scores.performance).toBeNull()
  })
})

describe('textReport', () => {
  test('lists every page with its scores and metrics', () => {
    const report = textReport([summarize('/', lhr(0.976)), summarize('/about', lhr(0.5))])

    expect(report).toMatch(/\/\s+98\s+100\s+96\s+82/)
    expect(report).toMatch(/\/about\s+50\s+100/)
    expect(report).toContain('2.1 s')
  })
})

describe('markdownReport', () => {
  const pages: PageResult[] = [summarize('/', lhr(0.976)), summarize('/about', lhr(0.3, '6.4 s'))]
  const input = { pages, runs: 3, lighthouseVersion: '13.5.0' }

  test('starts with the marker CI uses to find its own comment', () => {
    expect(markdownReport(input).startsWith(marker)).toBe(true)
  })

  test('has a row of scores for every page, each with its number and colour', () => {
    const report = markdownReport(input)

    expect(report).toContain('| `/` | 🟢 98 | 🟢 100 | 🟢 96 | 🟠 82 |')
    expect(report).toContain('| `/about` | 🔴 30 |')
  })

  test('shows each performance metric', () => {
    const report = markdownReport(input)

    expect(report).toContain('Largest Contentful Paint')
    expect(report).toContain('🔴 6.4 s')
  })

  test('says how it measured, and which Lighthouse did it', () => {
    const report = markdownReport(input)

    expect(report).toContain('median of 3 runs')
    expect(report).toContain('Lighthouse 13.5.0')
  })

  test('links to the full reports when there is a link', () => {
    expect(markdownReport(input)).not.toContain('Full reports')
    expect(markdownReport({ ...input, reportsUrl: 'https://example.com/r' })).toContain(
      '[download them](https://example.com/r)',
    )
  })
})
