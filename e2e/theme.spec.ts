import { expect, test } from '@playwright/test'
import { palette } from '../src/lib/palette'

// Without a theme toggle (step 22), the page follows the system setting: the browser reports
// it to CSS as prefers-color-scheme, and the palette's light-dark() colours pick a value from it.
test('the page follows the system colour scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const body = page.locator('body')
  // Whatever palette is switched on, read its light background as the browser computes it.
  const lightBackground = await body.evaluate((el) => getComputedStyle(el).backgroundColor)

  // Switching the system setting restyles the page at once, without a reload.
  await page.emulateMedia({ colorScheme: 'dark' })

  await expect(body).not.toHaveCSS('background-color', lightBackground)
})

test('the palette from src/lib/palette.ts is on the page', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('html')).toHaveAttribute('data-palette', palette)
})
