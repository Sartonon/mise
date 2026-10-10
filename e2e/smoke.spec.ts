import { expect, test } from '@playwright/test'

// A smoke test: the smallest check that the whole app starts and serves a page.
test('the home page says hello', async ({ page }) => {
  await page.goto('/')

  // DEMO: this heading doesn't exist, so the test fails on purpose (do not merge).

  // Same idea as Testing Library: find things by role and name, the way a user would.
  // `expect` on a locator retries until it passes or times out, so no manual waiting.
  await expect(page.getByRole('heading', { name: 'Hello, World' })).toBeVisible()
  await expect(page).toHaveTitle(/Mise/)
})
