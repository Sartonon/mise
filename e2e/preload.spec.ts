import { expect, test } from '@playwright/test'

test('resting the pointer on a link loads its page data before the click', async ({ page }) => {
  await page.goto('/about')
  await expect(page.locator('body[data-hydrated]')).toBeAttached()

  // Every call to a server function from the browser (Home's loader makes one).
  const serverFnCalls: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/_serverFn/')) serverFnCalls.push(request.url())
  })

  const home = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Home' })
  await home.hover()
  // The hover alone loads Home's data...
  await expect.poll(() => serverFnCalls.length).toBe(1)

  await home.click()
  await expect(page.getByText('Rendered by the server at')).toBeVisible()
  // ...and the click uses it, without asking the server again.
  expect(serverFnCalls).toHaveLength(1)
})
