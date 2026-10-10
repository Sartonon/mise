// DEMO, do not merge: every problem in this file is planted on purpose, and the comment
// above each one names the tools that should catch it.
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

type Slot = 'breakfast' | 'lunch' | 'dinner'

// ESLint (strictTypeChecked): `switch-exhaustiveness-check`, "dinner" has no case.
// Knip: an unused export (nothing outside this file imports it).
export function slotLabel(slot: Slot) {
  switch (slot) {
    case 'breakfast':
      return 'Breakfast'
    case 'lunch':
      return 'Lunch'
  }
}

export function ChecksDemo({ recipes }: { recipes: string[] }) {
  const [added, setAdded] = useState(false)
  // 0 here, but computed, so TypeScript can't tell it's always 0.
  const favourites = recipes.length - 2

  const first = recipes[0]
  // ESLint (strictTypeChecked): `only-throw-error`, a string is thrown instead of an Error.
  if (first === undefined) throw 'No recipes'

  return (
    <>
      <h1>Checks demo</h1>
      {/* ESLint (strictTypeChecked): `no-unnecessary-condition`, `first` is never undefined here. */}
      <p>First recipe: {first ?? 'none'}</p>

      <ul>
        {/* ESLint (@eslint-react): `no-missing-key`, list items need a `key`. */}
        {recipes.map((recipe) => (
          <li>{recipe}</li>
        ))}
      </ul>

      {/* ESLint (@eslint-react): `no-leaked-conditional-rendering`. favourites is 0, so the
          page shows a stray "0" instead of nothing. */}
      {favourites && <p>{favourites} favourites</p>}

      {/* ESLint (jsx-a11y-x): `alt-text`. Playwright + axe: `image-alt`. Both catch it. */}
      <img src="/favicon.svg" width={32} height={32} />

      {/* ESLint (jsx-a11y-x): `anchor-has-content`. Playwright + axe: `link-name`.
          Both catch it: a screen reader would just say "link". */}
      <Link to="/about" style={{ display: 'inline-block', minHeight: 24, minWidth: 24 }} />

      {/* ESLint (jsx-a11y-x): `click-events-have-key-events`, `no-static-element-interactions`.
          Playwright: e2e/keyboard.spec.ts can't reach it with the keyboard. axe misses this one. */}
      <div
        onClick={() => {
          setAdded(true)
        }}
      >
        Add to plan
      </div>
      {added && <p>Added to the plan.</p>}

      {/* Playwright + axe only: `label`, a field with no name. The lint rule for unlabelled
          inputs ignores <input>. (A placeholder would count as a name for axe.) */}
      <input type="text" />

      {/* Playwright + axe only: `color-contrast`. No lint rule can see colours. */}
      <p style={{ color: '#bbb' }}>Pale grey text on white is hard to read.</p>
    </>
  )
}
