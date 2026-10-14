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

test('the cooking tip button works with Enter, Space and a click', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Show a cooking tip' })
  // The live region a screen reader reads out when its text changes.
  const tip = page.getByRole('status')
  await expect(tip).toBeEmpty()

  await button.focus()
  await page.keyboard.press('Enter')
  await expect(tip).toHaveText('Salt pasta water until it tastes like the sea.')
  // Pressing the button leaves focus on it, so the user can press it again.
  await expect(button).toBeFocused()

  await page.keyboard.press('Space')
  await expect(tip).toHaveText('Let meat rest after cooking, so the juices stay in.')

  await button.click()
  await expect(tip).toHaveText('Toast spices in a dry pan to wake up their flavour.')
})

test('the theme toggle is one Tab stop, with arrow keys between its options', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Theme' })
  await page.getByRole('link', { name: 'About' }).focus()

  // Tab goes into the group once...
  await page.keyboard.press('Tab')
  await expect(group.getByRole('radio', { name: 'Light' })).toBeFocused()

  // ...the arrow keys move focus inside it, without choosing...
  await page.keyboard.press('ArrowRight')
  await expect(group.getByRole('radio', { name: 'Dark' })).toBeFocused()
  // (The browser in these tests reports a light system setting.)
  await expect(group.getByRole('radio', { name: 'Light' })).toBeChecked()

  // ...Space chooses the focused option...
  await page.keyboard.press('Space')
  await expect(group.getByRole('radio', { name: 'Dark' })).toBeChecked()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  // ...and the next Tab leaves the group, instead of visiting each option.
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Show a cooking tip' })).toBeFocused()
})

test('when going back to a page fails, focus moves to the error page heading', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Main' })
  await nav.getByRole('link', { name: 'About' }).click()
  await expect(page.getByRole('heading', { name: 'About' })).toBeFocused()

  // Home's loader fails from now on (see error.spec.ts). Going back, Home first shows the data
  // it loaded before and focuses its heading. Then loading fresh data fails, and the error page
  // replaces Home, heading and all.
  await page.route('**/_serverFn/**', (route) =>
    route.fulfill({ status: 500, body: 'Internal Server Error' }),
  )
  await nav.getByRole('link', { name: 'Home' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeFocused()

  // The heading has focus, so the next Tab is the first control after it.
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Try again' })).toBeFocused()

  await page.unroute('**/_serverFn/**')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Rendered by the server at')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Hello, Mise' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Show a cooking tip' })).toBeFocused()
})
