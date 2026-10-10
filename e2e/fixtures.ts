import AxeBuilder from '@axe-core/playwright'
import { test as base } from '@playwright/test'

// Our own `test`: Playwright's, plus a `makeAxeBuilder` fixture. A spec that imports `test`
// from this file instead of '@playwright/test' can ask for it like it asks for `page`.
export const test = base.extend<{ makeAxeBuilder: () => AxeBuilder }>({
  makeAxeBuilder: async ({ page }, use) => {
    // axe-core (from Deque) checks the rendered page: the real HTML, CSS and colours,
    // after JavaScript ran. These tags pick its rules for WCAG 2.0, 2.1 and 2.2 at level
    // A and AA (the usual legal and industry target), plus its "best practices", like
    // having exactly one <main> and one <h1>.
    await use(() =>
      new AxeBuilder({ page }).withTags([
        'wcag2a',
        'wcag2aa',
        'wcag21a',
        'wcag21aa',
        'wcag22a',
        'wcag22aa',
        'best-practice',
      ]),
    )
  },
})

export { expect } from '@playwright/test'
