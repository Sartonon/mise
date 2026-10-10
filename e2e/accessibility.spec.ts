import { expect, test } from './fixtures'

// Every page, including the not-found page. Add new routes here as they're built.
const pages = ['/', '/about', '/no-such-page']

for (const path of pages) {
  test(`${path} has no accessibility violations`, async ({ page, makeAxeBuilder }) => {
    await page.goto(path)
    // Scan the page React has taken over, the same one a user interacts with.
    await expect(page.locator('body[data-hydrated]')).toBeAttached()

    const results = await makeAxeBuilder().analyze()

    // On failure, this prints each violation: the rule, why it matters, a help link,
    // and the HTML of every element that broke it.
    expect(results.violations).toEqual([])
  })
}
