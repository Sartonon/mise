import { expect, test } from '@playwright/test'

test('the nav bar links to the About page and back', async ({ page }) => {
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Main' })

  await nav.getByRole('link', { name: 'About' }).click()

  await expect(page).toHaveURL('/about')
  await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
  await expect(page).toHaveTitle('About · Mise')
  // The link to the page we're on is marked as the current one.
  await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')

  await nav.getByRole('link', { name: 'Home' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Hello, Mise' })).toBeVisible()
})
