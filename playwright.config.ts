import { defineConfig, devices } from '@playwright/test'

// End-to-end tests: a real browser talks to the real app, over HTTP, like a user would.
const PORT = 3000
const baseURL = `http://localhost:${PORT}`

// GitHub Actions sets CI=true.
const isCI = !!process.env.CI

export default defineConfig({
  // Only files in e2e/ are Playwright tests. Vitest only looks in src/, so they never mix.
  testDir: './e2e',

  // A `test.only` left in by accident would silently skip every other test, so CI rejects it.
  forbidOnly: isCI,
  // On CI, retry a failed test once. If it then passes, the report marks it "flaky".
  retries: isCI ? 1 : 0,
  // Stop the whole run if it takes longer than 10 minutes, so the report still gets written.
  globalTimeout: isCI ? 10 * 60_000 : undefined,

  // 'list' prints each test in the terminal. 'html' writes playwright-report/
  // ('never' = don't open it in a browser automatically; run `pnpm exec playwright show-report`).
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // Lets tests write `page.goto('/')` instead of the full URL.
    baseURL,
    // When a test fails on its retry, save a trace: a step-by-step recording with
    // DOM snapshots, network and console you can open in the report.
    trace: 'on-first-retry',
  },

  // Which browsers to run in. Chromium only for now: it keeps CI fast.
  // Firefox and WebKit (Safari's engine) can be added here later as more projects.
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  // Before the tests, build the app and start the production server, then wait until
  // `url` answers. We test the production build, because that is what users get.
  webServer: {
    command: 'pnpm build && pnpm start',
    url: baseURL,
    env: { PORT: String(PORT) },
    // Locally, if the server is already running, use it instead of starting another.
    // On CI, always start a fresh one.
    reuseExistingServer: !isCI,
    // Building first takes a while, so allow up to 2 minutes.
    timeout: 120_000,
  },
})
