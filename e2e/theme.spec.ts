import { expect, test } from '@playwright/test'
import { palette } from '../src/lib/palette'

// Until someone uses the theme toggle, the page follows the system setting: the browser reports
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

test('a chosen theme wins over the system and is there from the first paint after a reload', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await expect(page.locator('body[data-hydrated]')).toBeAttached()
  const body = page.locator('body')
  const lightBackground = await body.evaluate((el) => getComputedStyle(el).backgroundColor)

  await page.getByRole('radio', { name: 'Dark' }).click()

  await expect(body).not.toHaveCSS('background-color', lightBackground)

  // Runs in the page before any of its own scripts, on every load from now on. It notes the
  // theme at the moment <body> is added: the browser can't draw any of the page before that,
  // so if the theme is set by then, the first paint has the right colours (no flash).
  await page.addInitScript(() => {
    new MutationObserver((_, observer) => {
      // (TypeScript types document.body as always there; this early, it isn't yet.)
      if (!document.querySelector('body')) return
      document.documentElement.dataset.themeAtFirstBody =
        document.documentElement.dataset.theme ?? 'none'
      observer.disconnect()
    }).observe(document, { childList: true, subtree: true })
  })
  // React reports a server/browser mismatch as a console error, so collect them.
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.reload()

  await expect(page.locator('html')).toHaveAttribute('data-theme-at-first-body', 'dark')
  await expect(body).not.toHaveCSS('background-color', lightBackground)
  await expect(page.locator('body[data-hydrated]')).toBeAttached()
  // After hydration, the toggle shows the saved choice too.
  await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked()
  expect(errors).toEqual([])
})

test('choosing System follows the system setting again', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await expect(page.locator('body[data-hydrated]')).toBeAttached()
  const body = page.locator('body')
  const lightBackground = await body.evaluate((el) => getComputedStyle(el).backgroundColor)
  await page.getByRole('radio', { name: 'Dark' }).click()
  await expect(body).not.toHaveCSS('background-color', lightBackground)

  await page.getByRole('radio', { name: 'System' }).click()

  await expect(body).toHaveCSS('background-color', lightBackground)
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(body).not.toHaveCSS('background-color', lightBackground)
})
