---
name: record
description: Record videos and screenshots of the app in a real browser and send them to the user. Use when the user asks for a video, a screenshot or a recording.
---

# Record videos and screenshots

Everything here lives in the scratchpad (`$S` below), so nothing reaches the repo. Paths use
`/home/user/mise` for the project root; change them if `pwd` differs.

## 1. Config

Write `$S/rec/record.config.mts`. It's a plain object: `@playwright/test` can't be imported from
outside the project, but the project's config can.

```ts
import base from '/home/user/mise/playwright.config.ts'

export default {
  ...base,
  // The e2e tests, or a folder of one-off specs (step 2).
  testDir: process.env.SPECS ?? '/home/user/mise/e2e',
  outputDir: `${import.meta.dirname}/results`,
  reporter: 'list',
  use: { ...base.use, video: { mode: 'on', size: { width: 1280, height: 720 } }, screenshot: 'on' },
  // Start `pnpm dev` in the project, not next to this file.
  webServer: { ...base.webServer, cwd: '/home/user/mise' },
}
```

## 2. Record

From the project root, for e2e tests (narrow with file names or `-g "<part of a title>"`):

```sh
pnpm exec playwright test -c $S/rec/record.config.mts navigation theme
```

For something no test shows (another screen size, a state no test reaches), write a one-off spec in
`$S/rec/specs/` and run it with `SPECS=$S/rec/specs`:

```ts
import { expect, test } from '/home/user/mise/node_modules/@playwright/test/index.mjs'

test.use({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' })

test('About page on a phone, dark mode', async ({ page }) => {
  await page.goto('/about')
  await expect(page.locator('body[data-hydrated]')).toBeVisible()
  // Extra screenshots go in the test's own folder (`import.meta` isn't available here).
  await page.screenshot({ path: test.info().outputPath('top.png') })
})
```

A failing test still records its video: send it, and say that it failed and why.

## 3. Collect, look, send

- Each test gets a folder in `$S/rec/results/` with `video.webm` (plus `video-1.webm` for each extra
  page it opened) and `test-finished-1.png`. A test that only uses `request` gets neither.
- Convert each video to MP4, which phones play, named after its test title (Playwright cuts folder
  names short):

  ```sh
  ffmpeg -loglevel error -y -i video.webm -c:v libx264 -pix_fmt yuv420p <name>.mp4
  ```

- Open every PNG with Read and check it shows what the user asked for, then send the PNGs and MP4s
  with SendUserFile.

## No video

Videos need the ffmpeg that `.claude/hooks/session-start.sh` sets up through
`PLAYWRIGHT_BROWSERS_PATH`. If tests fail with `Executable doesn't exist at .../ffmpeg-NNNN`, or pass
with no `video.webm`, check `echo $PLAYWRIGHT_BROWSERS_PATH` and run the hook again:
`CLAUDE_CODE_REMOTE=true CLAUDE_PROJECT_DIR=$PWD bash .claude/hooks/session-start.sh`.
Outside a cloud session, run `pnpm exec playwright install ffmpeg` instead.
