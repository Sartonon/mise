import { expect, test } from '@playwright/test'

// Without a theme toggle (step 22), the page follows the system setting: the browser reports
// it to CSS as prefers-color-scheme, and our light-dark() colours pick a value from it.
test('the page follows the system colour scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const body = page.locator('body')
  // The light background from app.css, as the browser computes it.
  await expect(body).toHaveCSS('background-color', 'oklch(0.985 0.006 80)')

  // Switching the system setting restyles the page at once, without a reload.
  await page.emulateMedia({ colorScheme: 'dark' })

  await expect(body).toHaveCSS('background-color', 'oklch(0.2 0.015 45)')
})
