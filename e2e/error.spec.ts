import { expect, test } from './fixtures'

test('when a page fails to load, the error page offers to try again', async ({
  page,
  makeAxeBuilder,
}) => {
  await page.goto('/about')
  await expect(page.locator('body[data-hydrated]')).toBeAttached()

  // Make every server function call fail, as if the server were down. Home's loader calls one.
  await page.route('**/_serverFn/**', (route) =>
    route.fulfill({ status: 500, body: 'Internal Server Error' }),
  )
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Home' }).click()

  const heading = page.getByRole('heading', { name: 'Something went wrong' })
  await expect(heading).toBeVisible()
  // Like any page after a link click: focus on the heading, and a title that says what happened.
  await expect(heading).toBeFocused()
  await expect(page).toHaveTitle('Something went wrong · Mise')
  // It renders inside the layout, so the nav bar is still there.
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
  expect((await makeAxeBuilder().analyze()).violations).toEqual([])

  // The server is back: Try again loads the page.
  await page.unroute('**/_serverFn/**')
  await page.getByRole('button', { name: 'Try again' }).click()

  await expect(page.getByText('Rendered by the server at')).toBeVisible()
  await expect(page).toHaveTitle('Mise')
})
