---
name: check
description: Run every check that CI runs, locally, and report each one's result. Use before committing a step, before pushing, or when the user asks whether everything passes.
---

# Run the CI checks locally

CI (`.github/workflows/ci.yml`) runs these as separate jobs. Run them all, even after one fails,
so every problem shows up at once:

```bash
for s in lint:secrets format:check lint typecheck knip test build; do
  pnpm "$s" > /tmp/check-"${s/:/-}".log 2>&1 && echo "PASS $s" || echo "FAIL $s"
done
```

Then the browser tests, if the step changed anything a user can see or do:

```bash
pnpm test:e2e
```

Before a pull request that touches the build or the server, also run `CI=1 pnpm test:e2e`, which
tests the production build like the CI `e2e` job does.

Report a short table of PASS/FAIL. For each failure, read its log, fix the cause and rerun that one
check. If `format:check` fails, `pnpm format` fixes it; show the user what changed.

## In a cloud session

The SessionStart hook (`.claude/hooks/session-start.sh`) installs Node 24, pnpm and the
dependencies, and sets `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to the image's Chromium. If
`pnpm test:e2e` says a browser is missing, check that variable is set instead of running
`playwright install` (it can't download browsers there).
