import { expect, test } from '@playwright/test'

test('an unknown URL shows the not-found page, with a 404 status', async ({ page }) => {
  const response = await page.goto('/no-such-page')

  // The status matters for search engines and link checkers, not just the text.
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  // The title too: it's what a screen reader announces first, and what the tab shows.
  await expect(page).toHaveTitle('Page not found · Mise')
  // It renders inside the root layout, so the nav bar is still there.
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()

  await page.getByRole('link', { name: 'Go to the home page' }).click()
  await expect(page).toHaveURL('/')
})
