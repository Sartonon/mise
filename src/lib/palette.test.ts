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

type Oklch = [lightness: number, chroma: number, hue: number]

// The two oklch() colours in a role's `light-dark(light, dark)`.
function colours(block = '', role: string): Oklch[] {
  const value = new RegExp(`--${role}: (.*);`).exec(block)?.[1] ?? ''
  return [...value.matchAll(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/g)].map(
    ([, l, c, h]) => [Number(l), Number(c), Number(h)] as Oklch,
  )
}

// WCAG's contrast ratio, from 1 (same) to 21 (black on white).
function contrast(a: Oklch | undefined, b: Oklch | undefined): number {
  if (!a || !b) throw new Error('missing colour')
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (lighter + 0.05) / (darker + 0.05)
}

// How bright a colour is to the eye (WCAG's "relative luminance"): oklch → linear sRGB, using
// the matrices from the OKLab spec (https://bottosson.github.io/posts/oklab/), then weighted
// because green looks much brighter than blue.
function luminance([lightness, chroma, hue]: Oklch): number {
  const a = chroma * Math.cos((hue * Math.PI) / 180)
  const b = chroma * Math.sin((hue * Math.PI) / 180)
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  // Colours outside sRGB are clipped, as the screen shows them.
  const clip = (v: number) => Math.min(1, Math.max(0, v))
  const red = clip(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)
  const green = clip(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)
  const blue = clip(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}
