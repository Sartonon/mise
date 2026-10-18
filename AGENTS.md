# Mise — step-by-step learning project

This is a demo app (recipe & meal planner) that the user is building **to learn**, one small step at a time.
The user wants to follow along and understand every line, so the pace matters more than speed.

## Working rules

These hold in every session, for every coding agent. The project skills in `.claude/skills/` do the work (`.agents/skills/` links to them for Codex): `step` takes one plan step from explaining it to its pull request (use it when the user says "next" or asks what's next), and `a11y-check` is the checklist for any UI change.

- The plan is `docs/PLAN.md`. The first unticked step (`- [ ]`) is the next one, and each finished step is one commit named `step NN: ...`.
- Every finished step comes with **Try it yourself** steps (in the pull request and the reply): the exact commands to run and what to look at to test the feature and learn what's new in it.
- Do **exactly one** plan step per turn. Never combine steps or jump ahead. Then stop and wait for the user's questions or "next".
- Build things by hand. Don't use scaffolders that generate code the user hasn't seen explained.
- Before installing packages, check their current versions and docs, because TanStack Start changes quickly.
- For TanStack APIs, read the skill that ships with the installed version first: look for `SKILL.md` files in the package's `skills/` directory under `node_modules/.pnpm/`. Then Context7, if it's connected, or https://tanstack.com. If they disagree, the installed types in `node_modules` win.
- Keep server logic in plain functions, so it can be tested against an in-memory database.
- The user merges pull requests, and creates and signs in to accounts (GitHub, Vercel, Turso) themselves. Never handle their passwords or tokens, and never commit secrets.
- If something in the plan turns out to be wrong or outdated, explain it to the user and update `docs/PLAN.md` instead of quietly doing something different.
- Accessibility target: WCAG 2.2 AA. Every change to UI goes through the `a11y-check` skill.

## Commands

Use **pnpm** only (never npm or yarn). Scripts will be listed here as they're added.

- `pnpm dev`: start the dev server with hot reload (http://localhost:3000)
- `pnpm build`: build the app for production into `.output/` (CI runs this). On Vercel (where `VERCEL` is set) it writes `.vercel/output/` instead
- `pnpm size`: measure the last build's JavaScript and CSS (raw and Brotli-compressed) and fail if it's over the budget in `scripts/bundle-size/budget.ts`. Every `pnpm build` also writes a treemap of the browser bundle to `bundle-report/treemap.html`. On pull requests, the `Bundle size` workflow comments with the change against `main`
- `pnpm start`: run the production server from `.output/` with Node (run `pnpm build` first)
- `pnpm typecheck`: type-check everything with `tsc` (TypeScript 7)
- `pnpm test`: run the Vitest tests once
- `pnpm test:watch`: rerun the tests whenever a file changes
- `pnpm test:e2e`: run the Playwright tests in `e2e/` against a dev server on port 3100. `CI=1 pnpm test:e2e` builds and tests the production server instead, as CI does. The first time, run `pnpm exec playwright install chromium`
- `pnpm format`: format every file with Prettier
- `pnpm format:check`: fail if any file isn't formatted (CI runs this)
- `pnpm lint`: run ESLint, including the rules that use type information. Warnings fail it too (`--max-warnings 0`)
- `pnpm knip`: find unused files, exports and dependencies, and imports of packages missing from `package.json` (CI runs this). Config: `knip.config.ts`
- `pnpm lint:secrets`: scan every file (except those in `.gitignore`) for tokens, keys and passwords (CI runs this)
- `pnpm prepare`: install the git hooks (runs automatically on `pnpm install`). The pre-commit hook runs lint-staged: `secretlint` on every staged file, plus `eslint --fix --max-warnings 0`, `prettier --write` and `vitest related` on the staged files
