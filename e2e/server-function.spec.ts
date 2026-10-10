import { expect, test } from '@playwright/test'

test('the server time is already in the HTML the server sends', async ({ request }) => {
  // A plain HTTP request: no browser, so no JavaScript runs.
  // If the text is in this HTML, the server rendered it.
  const response = await request.get('/')
  const html = await response.text()

  expect(html).toContain('Rendered by the server at')
  expect(html).toMatch(/<time dateTime="\d{4}-\d{2}-\d{2}T[\d:.]+Z">/)
})

test('navigating back to Home calls the server function from the browser', async ({ page }) => {
  await page.goto('/about')
  // Wait until React has "hydrated" the page (see __root.tsx). A click before that is a
  // plain link click: the browser loads the whole page from the server, and the loader
  // runs there instead of calling the server function.
  await expect(page.locator('body[data-hydrated]')).toBeAttached()

  // Start listening before the click, so the request can't be missed.
  const serverFnRequest = page.waitForRequest((request) => request.url().includes('/_serverFn/'))
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Home' }).click()
  await serverFnRequest

  await expect(page.getByText('Rendered by the server at')).toBeVisible()
})
