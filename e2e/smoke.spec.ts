import { expect, test } from '@playwright/test'

// A smoke test: the smallest check that the whole app starts and serves a page.
test('the home page says hello', async ({ page }) => {
  await page.goto('/')

  // Same idea as Testing Library: find things by role and name, the way a user would.
  // `expect` on a locator retries until it passes or times out, so no manual waiting.
  await expect(page.getByRole('heading', { name: 'Hello, Mise' })).toBeVisible()
  await expect(page).toHaveTitle(/Mise/)
})

test('the favicons are linked and served', async ({ page, request }) => {
  await page.goto('/')

  for (const href of ['/favicon.ico', '/favicon.svg']) {
    await expect(page.locator(`head link[rel="icon"][href="${href}"]`)).toHaveCount(1)
    // `request` makes plain HTTP requests, without the browser: quick for checking files.
    const response = await request.get(href)
    expect(response.status()).toBe(200)
  }
})

test('the self-hosted fonts load from our own server', async ({ page }) => {
  // Collect every font the browser downloads.
  const fontUrls: string[] = []
  page.on('response', (response) => {
    if (response.request().resourceType() === 'font') fontUrls.push(response.url())
  })
  await page.goto('/')

  // document.fonts is the page's list of @font-face fonts, each with a status. `ready` waits until
  // the ones the page uses have loaded. Then: which families are actually loaded?
  const loadedFamilies = await page.evaluate(async () => {
    await document.fonts.ready
    return [...document.fonts].filter((font) => font.status === 'loaded').map((font) => font.family)
  })

  expect(new Set(loadedFamilies)).toEqual(new Set(['DM Sans Variable', 'Unbounded Variable']))
  // Both come from this site (no Google Fonts), each once: the preload and the CSS share it.
  const origin = new URL(page.url()).origin
  expect(fontUrls.length).toBeGreaterThan(0)
  for (const url of fontUrls) expect(url.startsWith(origin)).toBe(true)
  expect(new Set(fontUrls).size).toBe(fontUrls.length)
})
