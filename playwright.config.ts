import { defineConfig, devices } from '@playwright/test'

// End-to-end tests: a real browser talks to the real app, over HTTP, like a user would.
// Its own port, not 3000 (where your own `pnpm dev` runs), so the tests always get the
// server started below, never one that happens to be running.
const PORT = 3100
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
  // On CI, 'github' also marks a failed test on the pull request, at the line that failed.
  reporter: [['list'], ['html', { open: 'never' }], ...(isCI ? [['github'] as const] : [])],

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

  // Before the tests, start the app and wait until `url` answers.
  webServer: {
    // On CI: build and run the production server, because that is what users get.
    // Locally: the dev server, which picks up file changes by itself. The VS Code extension
    // keeps this server running between test runs, so a production build would go stale.
    // (`--strictPort`: fail if 3100 is taken, instead of quietly moving to another port.)
    // To test the production build locally, run `CI=1 pnpm test:e2e`.
    command: isCI ? 'pnpm build && pnpm start' : `pnpm dev --port ${PORT} --strictPort`,
    url: baseURL,
    // Used by `pnpm start` (Nitro's server reads PORT).
    env: { PORT: String(PORT) },
    // Locally, if the server is already running, use it instead of starting another.
    // On CI, always start a fresh one.
    reuseExistingServer: !isCI,
    // Building first takes a while, so allow up to 2 minutes.
    timeout: 120_000,
  },
})
