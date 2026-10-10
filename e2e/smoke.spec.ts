import { expect, test } from '@playwright/test'

// A smoke test: the smallest check that the whole app starts and serves a page.
test('the home page says hello', async ({ page }) => {
  await page.goto('/')

  // Same idea as Testing Library: find things by role and name, the way a user would.
  // `expect` on a locator retries until it passes or times out, so no manual waiting.
  await expect(page.getByRole('heading', { name: 'Hello, Mise' })).toBeVisible()
  await expect(page).toHaveTitle(/Mise/)
})

test('the favicons are linked and served', async ({ page, request }) => {
  await page.goto('/')

  for (const href of ['/favicon.ico', '/favicon.svg']) {
    await expect(page.locator(`head link[rel="icon"][href="${href}"]`)).toHaveCount(1)
    // `request` makes plain HTTP requests, without the browser: quick for checking files.
    const response = await request.get(href)
    expect(response.status()).toBe(200)
  }
})
