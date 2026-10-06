# Mise — step-by-step learning project

This is a demo app (recipe & meal planner) that the user is building **to learn**, one small step at a time.
The user wants to follow along and understand every line, so the pace matters more than speed.

## Resuming work
1. Read `docs/PLAN.md`. The first unticked step (`- [ ]`) is the next one.
2. Run `git log --oneline` to confirm. Each finished step is one commit named `step NN: ...`.
3. Tell the user which step is next and what it covers, then wait for them to say "next".

## How to do each step
- Do **exactly one** plan step per turn. Never combine steps or jump ahead.
- Explain what the step adds and why, then write the code with short files and comments only where they teach something.
- Build things by hand. Don't use scaffolders that generate code the user hasn't seen explained.
- Before installing packages, check their current versions and docs, because TanStack Start changes quickly.
- Add the step's test along with its code (see the *Test:* note on the step; write it first for pure functions). Keep server logic in plain functions so it can be tested against an in-memory database. Once Playwright exists (step 13), add or extend an e2e test whenever a step changes something a user can see or do.
- Run a check that shows the step works (a command's output, a type error appearing, the page in the browser), plus `pnpm test` once it exists.
- Walk through the key lines, tick the step in `docs/PLAN.md`, and commit everything as `step NN: <short title>`.
- Stop and wait for the user's questions or "next".

If something in the plan turns out to be wrong or outdated, explain it to the user and update `docs/PLAN.md` instead of quietly doing something different.

## Commands
Use **pnpm** only (never npm or yarn). Scripts will be listed here as they're added.
