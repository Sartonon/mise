import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { palette, palettes } from './palette'

// The palettes live in two places: their names here in TypeScript (so the switch is type-checked)
// and their colours in CSS. These tests fail if the two drift apart.
const css = readFileSync(new URL('../styles/palettes.css', import.meta.url), 'utf8')

// Each `[data-palette='name'] { ... }` block in the CSS, as name → the roles it defines.
const blocks = new Map(
  [...css.matchAll(/\[data-palette='([a-z]+)'\]\s*\{([^}]*)\}/g)].map(
    ([, name = '', body = '']) => [
      name,
      [...body.matchAll(/--([a-z-]+):/g)].map(([, role]) => role),
    ],
  ),
)

describe('palettes', () => {
  it('has a CSS block for every palette in the list, and no others', () => {
    expect([...blocks.keys()].sort()).toEqual([...palettes].sort())
  })

  it('defines the same roles in every palette', () => {
    const [first, ...rest] = [...blocks.values()]
    for (const roles of rest) {
      expect(roles.sort()).toEqual(first?.sort())
    }
  })

  it('switches to a palette that exists', () => {
    expect(palettes).toContain(palette)
  })
})
