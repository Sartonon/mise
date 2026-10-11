import { describe, expect, test } from 'vitest'
import type { Asset } from './measure.ts'
import {
  bar,
  formatBytes,
  formatChange,
  marker,
  markdownReport,
  overBudget,
  textReport,
} from './report.ts'

const js = (name: string, compressed: number): Asset => ({
  name,
  kind: 'js',
  raw: compressed * 3,
  compressed,
})
const css = (name: string, compressed: number): Asset => ({
  name,
  kind: 'css',
  raw: compressed * 4,
  compressed,
})
const budget = { js: 10_000, css: 2_000 }

describe('formatBytes', () => {
  test('shows bytes below 1 kB, and kB with one decimal above', () => {
    expect(formatBytes(999)).toBe('999 B')
    expect(formatBytes(1000)).toBe('1 kB')
    expect(formatBytes(120_349)).toBe('120.3 kB')
    expect(formatBytes(200_000)).toBe('200 kB')
  })
})

describe('formatChange', () => {
  test('says which way the size went, in bytes and percent', () => {
    expect(formatChange(10_000, 11_200)).toBe('📈 +1.2 kB (+12.0%)')
    expect(formatChange(10_000, 9_500)).toBe('📉 −500 B (−5.0%)')
    expect(formatChange(500, 500)).toBe('no change')
  })

  test('shows a tiny change as <0.1%, not 0.0%', () => {
    expect(formatChange(1_000_000, 1_000_010)).toBe('📈 +10 B (+<0.1%)')
  })
})

describe('bar', () => {
  test('fills a share of the width, and stays full when over', () => {
    expect(bar(0.25, 8)).toBe('██░░░░░░')
    expect(bar(0, 4)).toBe('░░░░')
    expect(bar(1.5, 4)).toBe('████')
  })
})

describe('overBudget', () => {
  test('lists the kinds whose compressed total is over the budget', () => {
    expect(overBudget([js('a.js', 6_000), js('b.js', 5_000), css('app.css', 100)], budget)).toEqual(
      ['js'],
    )
    expect(overBudget([js('a.js', 10_000)], budget)).toEqual([])
  })
})

describe('textReport', () => {
  test('lists every file, the totals and the budget', () => {
    const report = textReport([js('index.js', 5_000), css('app.css', 1_000)], budget)

    expect(report).toContain('index.js')
    expect(report).toMatch(/JavaScript\s+15 kB\s+5 kB/)
    expect(report).toContain('50% of 10 kB')
  })
})

describe('markdownReport', () => {
  const base = [js('index.js', 5_000), js('about.js', 200), css('app.css', 1_000)]
  const head = [js('index.js', 5_500), js('recipes.js', 300), css('app.css', 1_000)]

  test('starts with the marker CI uses to find its own comment', () => {
    const report = markdownReport({ base, head, budget, baseName: 'main' })
    expect(report.startsWith(marker)).toBe(true)
  })

  test('sums up the change in one sentence and a table per kind', () => {
    const report = markdownReport({ base, head, budget, baseName: 'main' })

    expect(report).toContain('**This pull request adds 600 B** of what the browser downloads')
    expect(report).toContain('| JavaScript | 5.2 kB | 5.8 kB | 📈 +600 B (+11.5%) |')
    expect(report).toContain('| CSS | 1 kB | 1 kB | no change |')
  })

  test('marks new and removed files, and counts the changed ones', () => {
    const report = markdownReport({ base, head, budget, baseName: 'main' })

    expect(report).toMatch(/\| `recipes\.js` \| – \| 300 B \| 🆕 new \| `░{10}` 4% \|/)
    expect(report).toMatch(/\| `about\.js` \| 200 B \| – \| 🗑️ removed \|/)
    expect(report).toContain('Files: 4, changed: 3')
  })

  test('warns when the pull request goes over budget', () => {
    const big = [js('index.js', 20_000)]
    expect(markdownReport({ base, head: big, budget, baseName: 'main' })).toContain(
      'JavaScript is over budget',
    )
    expect(markdownReport({ base, head, budget, baseName: 'main' })).not.toContain('over budget')
  })

  test('links the treemap only when there is one', () => {
    const url = 'https://github.com/o/r/actions/runs/1/artifacts/2'
    expect(markdownReport({ base, head, budget, baseName: 'main', treemapUrl: url })).toContain(
      `[download the treemap](${url})`,
    )
    expect(markdownReport({ base, head, budget, baseName: 'main' })).not.toContain('treemap')
  })

  test('says so when nothing changed', () => {
    expect(markdownReport({ base, head: base, budget, baseName: 'main' })).toContain(
      '**No change** to what the browser downloads',
    )
  })
})
