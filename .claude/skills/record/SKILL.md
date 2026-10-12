---
name: record
description: Record videos and screenshots of the app in a real browser, from the e2e tests or a one-off capture, and send them to the user. Use when the user asks for a video, a screenshot or a recording.
---

# Record videos and screenshots

`record.config.ts` (next to this file) is `playwright.config.ts` plus a 1280×720 video and a final
screenshot of every test. `collect.ts` gathers them into one folder, named after the tests, as PNG
and MP4.

## 1. Pick what to record

- **An e2e test already shows it** (look in `e2e/`): record that test. A passing test is also the
  proof that the video shows the app working.
- **No test shows it** (another screen size, a state no test reaches, a page mid-change): write a
  one-off spec in `scratch/` next to this file, as in the example below. The folder is gitignored
  and left out of typecheck and lint.

```ts
// .claude/skills/record/scratch/about-phone.spec.ts
import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' })

test('the About page on a phone in dark mode', async ({ page }) => {
  await page.goto('/about')
  await expect(page.locator('body[data-hydrated]')).toBeVisible()
  // Extra screenshots mid-test: save, then attach, so collect.ts finds them by name.
  const path = test.info().outputPath('top.png')
  await page.screenshot({ path })
  await test.info().attach('top', { path, contentType: 'image/png' })
})
```

## 2. Record

```sh
pnpm exec playwright test -c .claude/skills/record/record.config.ts --project=chromium navigation theme
pnpm exec playwright test -c .claude/skills/record/record.config.ts --project=scratch
```

- Write `--project=<name>` with the `=`: `--project` takes several names, so a space would swallow
  the file filters that follow it.
- Narrow with file names (`navigation`) or `-g "<part of a test title>"`.
- Done when the run ends. A failing test still records its video: send it, and say it failed and why.

## 3. Collect

```sh
rm -rf <scratchpad>/media && node .claude/skills/record/collect.ts <scratchpad>/media
```

It prints one name per test, numbered in run order. Files: `<name>.png` (the final screenshot),
`<name>-<attachment>.png` (extra ones) and `<name>.mp4`.

## 4. Look, then send

- Open every PNG with Read before sending, and check it shows what the user asked for: the right
  page and state, not a blank page or an error overlay.
- Send PNGs and MP4s with SendUserFile (`display: 'render'`), and say in one line each what it shows.
- Delete the one-off spec from `scratch/` once its media is sent.

## When video recording fails

`Executable doesn't exist at .../ffmpeg-NNNN` means Playwright can't find its ffmpeg:

- **Cloud session:** `.claude/hooks/session-start.sh` builds `~/.cache/pw-browsers` with that ffmpeg
  and sets `PLAYWRIGHT_BROWSERS_PATH` to it. Check `echo $PLAYWRIGHT_BROWSERS_PATH`, run the hook
  again (`CLAUDE_CODE_REMOTE=true CLAUDE_PROJECT_DIR=$PWD bash .claude/hooks/session-start.sh`),
  and prefix the commands with `PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/pw-browsers` for this session.
- **Your own computer:** `pnpm exec playwright install ffmpeg`.

Tests that pass with no `.webm` in `test-results/record/` mean ffmpeg started and crashed. Rerun
one test with `DEBUG=pw:browser` and look for `ffmpeg error`.
