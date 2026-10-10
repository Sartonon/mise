// eslint-plugin-playwright: every line marked below breaks a rule.
// The file isn't named `.spec.ts`, so Playwright doesn't run it, but ESLint still checks it.
import { expect, test } from '@playwright/test'

// playwright/no-focused-test: a `test.only` left in would skip every other test.
test.only('home page', async ({ page }) => {
  await page.goto('/')

  // playwright/no-wait-for-timeout (a warning): a fixed wait is slow and still flaky.
  // Web-first assertions like `toBeVisible()` wait for the page on their own.
  await page.waitForTimeout(1000)

  // playwright/missing-playwright-await: without `await`, the test ends before the
  // assertion runs, so it passes whatever the page shows.
  expect(page.getByRole('heading', { name: 'Hello, Mise' })).toBeVisible()

  // playwright/no-element-handle: `page.$` returns an ElementHandle, which doesn't
  // wait or retry. Use a locator such as `page.getByRole` instead.
  const heading = await page.$('h1')
  expect(heading).not.toBeNull()
})
