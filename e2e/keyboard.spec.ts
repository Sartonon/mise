import { expect, test } from '@playwright/test'

// What keyboard and screen reader users rely on, and axe can't check: where focus goes.

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // Before hydration, links are plain links and focus code hasn't run yet (see __root.tsx).
  await expect(page.locator('body[data-hydrated]')).toBeAttached()
})

test('the first Tab reaches a skip link, which jumps to the content', async ({ page }) => {
  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: 'Skip to content' })
  await expect(skipLink).toBeFocused()

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

// DEMO, do not merge: "Add to plan" is a <div onClick>, which a keyboard can't reach or press.
// axe passes it; this test is what catches it.
test('the demo "Add to plan" control works from the keyboard', async ({ page }) => {
  await page.goto('/demo')
  await expect(page.locator('body[data-hydrated]')).toBeAttached()

  const addToPlan = page.getByRole('button', { name: 'Add to plan' })
  await addToPlan.focus({ timeout: 5_000 })
  await page.keyboard.press('Enter')

  await expect(page.getByText('Added to the plan.')).toBeVisible()
})
