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
- Add the step's test along with its code (see the _Test:_ note on the step; write it first for pure functions). Keep server logic in plain functions so it can be tested against an in-memory database. Once Playwright exists (step 16), add or extend an e2e test whenever a step changes something a user can see or do.
- Run a check that shows the step works (a command's output, a type error appearing, the page in the browser), plus `pnpm test` once it exists.
- Walk through the key lines, tick the step in `docs/PLAN.md`, and commit everything as `step NN: <short title>`.
- Once the GitHub repo exists (step 4), push after each step's commit. Once CI exists (step 6), check that it's green; once Vercel is set up (step 14), check the deploy too. When a step adds a new check (format, lint, build, e2e), add it to CI in the same step.
- The user creates and signs in to accounts (GitHub, Vercel, Turso) themselves. Never handle their passwords or tokens, and never commit secrets.
- Stop and wait for the user's questions or "next".

If something in the plan turns out to be wrong or outdated, explain it to the user and update `docs/PLAN.md` instead of quietly doing something different.

## Commands

Use **pnpm** only (never npm or yarn). Scripts will be listed here as they're added.

- `pnpm dev`: start the dev server with hot reload (http://localhost:5173)
- `pnpm build`: build the app for production into `dist/` (CI runs this)
- `pnpm start`: serve the production build from `dist/` (run `pnpm build` first)
- `pnpm typecheck`: type-check everything with `tsc` (TypeScript 7)
- `pnpm test`: run the Vitest tests once
- `pnpm test:watch`: rerun the tests whenever a file changes
- `pnpm format`: format every file with Prettier
- `pnpm format:check`: fail if any file isn't formatted (CI runs this)
- `pnpm lint`: run ESLint, including the rules that use type information
- `pnpm lint:secrets`: scan every file (except those in `.gitignore`) for tokens, keys and passwords (CI runs this)
- `pnpm prepare`: install the git hooks (runs automatically on `pnpm install`). The pre-commit hook runs lint-staged: `secretlint` on every staged file, plus `eslint --fix`, `prettier --write` and `vitest related` on the staged files
