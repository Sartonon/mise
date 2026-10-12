import { join } from 'node:path'

import { defineConfig, devices } from '@playwright/test'

import base from '../../../playwright.config.ts'

// The normal e2e config, plus a video and a screenshot of every test, for showing the
// user what a test does. See SKILL.md next to this file for how to run it.
const root = join(import.meta.dirname, '../../..')

// Paths in a config are relative to the config file, so the server must be told to start
// in the project root (where `pnpm dev` works), not in this folder.
const { webServer } = base
if (!webServer || Array.isArray(webServer)) {
  throw new Error('record.config.ts expects one webServer in playwright.config.ts')
}

export default defineConfig({
  ...base,
  testDir: join(root, 'e2e'),
  outputDir: join(root, 'test-results/record'),
  reporter: [['list'], ['json', { outputFile: join(root, 'test-results/record-report.json') }]],
  use: {
    ...base.use,
    // Full size: the default shrinks videos to 800×450.
    video: { mode: 'on', size: { width: 1280, height: 720 } },
    screenshot: 'on',
  },
  projects: [
    ...(base.projects ?? []),
    // One-off captures that aren't real tests. The folder is gitignored.
    {
      name: 'scratch',
      testDir: join(import.meta.dirname, 'scratch'),
      use: devices['Desktop Chrome'],
    },
  ],
  webServer: { ...webServer, cwd: root },
})
