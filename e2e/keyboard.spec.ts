import { expect, test } from '@playwright/test'

// What keyboard and screen reader users rely on, and axe can't check: where focus goes.

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // Before hydration, links are plain links and focus code hasn't run yet (see __root.tsx).
  await expect(page.locator('body[data-hydrated]')).toBeAttached()
})

test('the first Tab reaches a skip link, which jumps to the content', async ({ page }) => {
  const skipLink = page.getByRole('link', { name: 'Skip to content' })
  // Hidden from sight until it has focus (Tailwind's sr-only shrinks it to 1×1 pixel)...
  await expect(skipLink).toHaveCSS('width', '1px')

  await page.keyboard.press('Tab')
  await expect(skipLink).toBeFocused()
  // ...then shown, so a sighted keyboard user can see where focus is.
  await expect(skipLink).not.toHaveCSS('width', '1px')

  await page.keyboard.press('Enter')

  await expect(page.getByRole('main')).toBeFocused()
})

test('after navigating with a link, focus is on the new page heading', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Main' })

  // Keyboard first: focus the link and press Enter, the way a keyboard user follows it.
  await nav.getByRole('link', { name: 'About' }).focus()
  await page.keyboard.press('Enter')

  await expect(page.getByRole('heading', { name: 'About' })).toBeFocused()

  // And the same after a mouse click, back to Home.
  await nav.getByRole('link', { name: 'Home' }).click()

  await expect(page.getByRole('heading', { name: 'Hello, Mise' })).toBeFocused()
})

test('a full page load leaves focus alone', async ({ page }) => {
  // The browser starts at the top of the page by itself, so nothing should be focused yet.
  await expect(page.getByRole('heading', { name: 'Hello, Mise' })).not.toBeFocused()
  await expect(page.locator('body')).toBeFocused()
})
