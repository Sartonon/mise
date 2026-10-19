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

  // The no-flash check: the observer above recorded "dark" (not "none") when <body> appeared,
  // so the inline theme script had already run before anything could be drawn.
  await expect(page.locator('html')).toHaveAttribute('data-theme-at-first-body', 'dark')
  await expect(body).not.toHaveCSS('background-color', lightBackground)
  await expect(page.locator('body[data-hydrated]')).toBeAttached()
  // After hydration, the toggle shows the saved choice too.
  await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked()
  expect(errors).toEqual([])
})

// Backgrounds and borders fade when the theme changes. They must all fade together: anything
// that switched at once, faded at another speed, or restarted its fade partway would show the
// old theme's colours after the rest of the page had moved on.
test('switching the theme fades the page together, with nothing left behind', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await expect(page.locator('body[data-hydrated]')).toBeAttached()

  const { fades, restarted } = await page.evaluate(async () => {
    // transitioncancel fires when a fade is stopped partway, for example to start it over.
    const restarted: string[] = []
    document.addEventListener('transitioncancel', (event) => restarted.push(event.propertyName))
    // A click from code, not Playwright's mouse: the pointer hovering the button first would
    // start a hover fade of its own, earlier than the theme's.
    document.querySelector<HTMLElement>('[aria-label="Dark"]')?.click()
    // Wait for the next frame, as the browser does before drawing: by then React has updated
    // the toggle too.
    await new Promise(requestAnimationFrame)
    // Every fade (CSS transition) the click started, once each knows when it starts.
    const transitions = document.getAnimations().filter((a) => a instanceof CSSTransition)
    await Promise.all(transitions.map((t) => t.ready))
    const fades = transitions.map((t) => ({
      property: t.transitionProperty,
      onBody: t.effect instanceof KeyframeEffect && t.effect.target === document.body,
      timing: JSON.stringify({ start: t.startTime, duration: t.effect?.getTiming().duration }),
    }))
    // Wait for them to finish, to hear about any that restart.
    await Promise.all(transitions.map((t) => t.finished))
    return { fades, restarted }
  })

  // The page's own background fades...
  expect(fades).toContainEqual(
    expect.objectContaining({ property: 'background-color', onBody: true }),
  )
  // ...every other fade starts at the same moment and lasts as long...
  expect(new Set(fades.map((fade) => fade.timing)).size).toBe(1)
  // ...and none is stopped partway.
  expect(restarted).toEqual([])
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('before a choice, the toggle shows the system setting and follows it', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await expect(page.locator('body[data-hydrated]')).toBeAttached()

  await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked()

  // The system switches to light, and nothing was chosen, so the toggle follows.
  await page.emulateMedia({ colorScheme: 'light' })

  await expect(page.getByRole('radio', { name: 'Light' })).toBeChecked()
  await expect(page.locator('html')).not.toHaveAttribute('data-theme')
})
