---
name: step
description: Do the next step of docs/PLAN.md the way AGENTS.md asks, from explaining it to opening its pull request. Use when the user says "next", "/step", "continue the plan", or asks which step is next.
---

# One plan step

AGENTS.md has the rules. This is the order to do them in, with the commands.

## 1. Find the step

- The next step is the first `- [ ]` line in `docs/PLAN.md`: `grep -n -m1 '^- \[ \]' docs/PLAN.md`.
- Confirm with `git log --oneline -5`: the last step commit (`step NN: ...`) is the one before it.
- If the user hasn't said "next" yet, say which step it is and what it covers, then **stop and wait**.

## 2. Before writing code

- Explain what the step adds and why, in a few short paragraphs. The user is learning.
- For each package to install, check the current version and its docs first:
  `pnpm view <pkg> version peerDependencies engines`, then the package's own docs or changelog.
  TanStack Start changes quickly, so don't trust remembered APIs.
  For a TanStack API, start with the installed package's `skills/` directory (look for
  `SKILL.md` under `node_modules/.pnpm/`), then Context7.
- If the plan turns out to be wrong or outdated, tell the user and edit the step in `docs/PLAN.md`
  with a short _(Updated: ...)_ note, as earlier steps do. Keep plan entries brief: only decisions
  and changes that later steps depend on. The details belong in the commit and pull request.

## 3. Write it

- Only this step. Short files, comments only where they teach something.
- Install with `pnpm add` / `pnpm add -D` (never npm or yarn), and build files by hand, not with scaffolders.
- The test from the step's _Test:_ note. For a pure function, write the test first and show it failing.
- Server logic goes in plain functions that the server functions call, tested against an in-memory
  database.
- UI change: also follow the `a11y-check` skill, and add or extend an e2e test in `e2e/`.
- A new script: add it to the **Commands** list in AGENTS.md. A new check (format, lint, build, e2e...):
  add it to `.github/workflows/ci.yml` in the same step.

## 4. Show that it works

- The step's own check (a command's output, the type error appearing, the page in the browser).
- Then run every script in the `matrix` of `.github/workflows/ci.yml`, all of them even after one
  fails, so every problem shows up at once. Add `pnpm test:e2e` when the step changes what a user
  sees or does.

## 5. Walk through and commit

- Walk through the key lines of the diff.
- Tick the step (`- [x]`) in `docs/PLAN.md`.
- Commit everything as `step NN: <short title>`. The pre-commit hook runs lint-staged; if it fails, fix
  the cause and make a new commit attempt (never `--no-verify`).

## 6. Pull request

- Push the commit to a branch and open a pull request into `main`, titled like the commit.
- The description ends with a **Try it yourself** section: numbered steps the user can follow on
  their own machine to see the new feature work and to learn the new thing in it. Give exact
  commands and what each one should show, e.g. for a database step the `pnpm` / `drizzle-kit` /
  SQL commands that list the tables or rows; for a UI step the page to open and what to click; for
  a new tool, a command that makes it fail and one that makes it pass. Add one or two "change this
  and see what happens" experiments, and a link to the relevant docs.
  In cloud sessions there is no `gh`: use the GitHub MCP tools (`mcp__github__create_pull_request`).
- Wait for CI to finish on the pull request and report the result. From step 14, check the Vercel
  preview deploy too.
- **The user merges it.** Never merge it yourself.

## 7. Stop

Summarise what changed, repeat the **Try it yourself** steps from the pull request, and wait for
questions or "next".
