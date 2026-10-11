import Color from 'colorjs.io'
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

  // axe checks text contrast on the page, but not focus outlines, so this checks --ring from the
  // CSS itself: at least 3:1 against every surface an outline can sit on (WCAG 1.4.11).
  it('has a focus ring with at least 3:1 contrast in light and dark mode', () => {
    for (const [, name, body] of css.matchAll(/\[data-palette='([a-z]+)'\]\s*\{([^}]*)\}/g)) {
      const ring = colours(body, 'ring')
      for (const surface of ['background', 'card', 'secondary']) {
        const other = colours(body, surface)
        for (const mode of [0, 1]) {
          expect(
            contrast(ring[mode], other[mode]),
            `${name ?? ''} ring on ${surface}, ${mode === 0 ? 'light' : 'dark'}`,
          ).toBeGreaterThanOrEqual(3)
        }
      }
    }
  })
})

// The two colours in a role's `light-dark(light, dark)`. A colour the screen can't show (outside
// sRGB) is brought into range the way CSS says browsers should, so the contrast is what you see.
function colours(block = '', role: string): Color[] {
  const value = new RegExp(`--${role}: (.*);`).exec(block)?.[1] ?? ''
  return [...value.matchAll(/oklch\([^)]*\)/g)].map(([oklch]) =>
    new Color(oklch).toGamut({ space: 'srgb' }),
  )
}

// WCAG's contrast ratio, from 1 (same) to 21 (black on white).
function contrast(a: Color | undefined, b: Color | undefined): number {
  if (!a || !b) throw new Error('missing colour')
  return a.contrast(b, 'WCAG21')
}
