# Plan: "Mise" — Recipe & Meal Planner, built in small steps

> **Progress:** tick a step's box (`- [x]`) in the same commit that finishes it.
> The first unticked step is the next one to do.

## Context

A demo app showing modern web development in one codebase: TypeScript, React, TanStack Start, React Query, Prettier, ESLint and pnpm, on Node 24 and pnpm 11.

- **Idea:** a recipe and meal planner
- **Data:** SQLite with Drizzle ORM (`@libsql/client`): a local file in development and tests, Turso in production
- **Extras:** Tailwind v4 + shadcn/ui, Zod + TanStack Form, Vitest + Testing Library + Playwright, Husky + lint-staged + GitHub Actions CI
- **Hosting:** GitHub, deployed to Vercel

**How we work:** small steps, one at a time, each explained, tested, committed as `step NN: ...` and checked in CI. Then stop and wait for "next". Build by hand, no scaffolders; check current versions and docs before installing.

**Testing:** every step that adds logic or UI adds or extends a test (the _Test:_ note). Pure functions are written test-first. From step 16, anything a user can see or do also gets a Playwright e2e test. Server logic lives in plain functions, tested against an in-memory database.

**CI and deploys:** every new check (format, lint, build, e2e) goes into CI in the same step. From step 14, pushing to `main` deploys to Vercel and pull requests get preview URLs. Step 27 moves production data to Turso, because Vercel can't keep a SQLite file.

**Accounts:** the user creates and signs in to GitHub, Vercel and Turso. Claude never handles passwords or tokens, and secrets never go into the repo.

---

## Phase A — Repository foundation

- [x] 1. **Git and the basics:** `.gitignore`, `.editorconfig`, `.nvmrc` (24), stub `README.md`.
- [x] 2. **pnpm package:** minimal `package.json` and `pnpm-workspace.yaml` (`engineStrict: true`). _(pnpm 11 only reads auth/registry settings from `.npmrc`.)_
- [x] 3. **TypeScript:** strict `tsconfig.json`, path alias `~/*`, `typecheck` script. _(TS 7 has no JS API yet, so `typescript` is aliased to `@typescript/typescript6` for tools like typescript-eslint, and `@typescript/native` gives the fast `tsc`. Revisit when TS 7.1 ships its API.)_
- [x] 4. **GitHub repository:** public repo https://github.com/Sartonon/mise.
- [x] 5. **Vitest:** `vitest.config.ts`, `test` scripts, and a test-first `slugify()`. _(Vitest 5 needs `vite` as a peer, so it's installed here.)_
- [x] 6. **GitHub Actions CI:** `ci.yml` runs `typecheck` and `test` on pushes to `main` and on pull requests.

## Phase B — Code quality tooling

- [x] 7. **Prettier:** config, ignore file, `format` and `format:check` (in CI).
- [x] 8. **ESLint base:** flat config with `@eslint/js`, type-checked `typescript-eslint` and `@vitest/eslint-plugin`; `lint` in CI.
- [x] 9. **ESLint and Prettier together:** `eslint-config-prettier`.
- [x] 10. **Git hooks:** Husky pre-commit runs lint-staged (Prettier, ESLint, `vitest related`). `typecheck` stays in CI only.
- [x] 10b. **Secret scanning:** `secretlint` in lint-staged and CI; the user turned on GitHub push protection.

## Phase C — The first page with TanStack Start

- [x] 11. **Vite and React:** `vite.config.ts` with the Start plugin. _(Vitest keeps its own config.)_
- [x] 12. **Router and root route:** `src/router.tsx`, `src/routes/__root.tsx`. _(`routeTree.gen.ts` is committed so `typecheck` works in CI without a build.)_
- [x] 13. **The first page:** "Hello, Mise" at `/`; `dev`, `build` and `start` scripts; `build` in CI.
- [x] 14. **Deploy to Vercel:** via Nitro v3 (beta, pinned exactly). It writes `.vercel/output/` on Vercel and a Node server to `.output/` elsewhere; `start` runs that server.
- [x] 15. **Component tests:** Testing Library with `jsdom`. Vitest `projects`: `unit` (`*.test.ts`, Node) and `component` (`*.test.tsx`, jsdom).
- [x] 16. **Playwright:** tests in `e2e/` on port 3100. CI tests the production build (Chromium only); locally it uses `pnpm dev`. Report uploaded on failure.
- [x] 17. **Second route and links:** `/about` and a nav bar. _Test:_ e2e nav test.
- [x] 18. **First server function:** server time from a loader. Plain `*.server.ts` function wrapped by `createServerFn` in `*.functions.ts`. _Test:_ unit, component and e2e (SSR HTML, client navigation calls `/_serverFn/`; waits for `<body data-hydrated>`).
- [x] 19. **ESLint for React and tests:** React Hooks, TanStack Router, Testing Library and Playwright plugins. Warnings fail lint (`--max-warnings 0`).
- [x] 19b. **CI and repo hardening:** one parallel CI job per check, `concurrency`, timeouts, `persist-credentials: false`. The user turned on auto-delete branches, CodeQL and Dependabot alerts. No ruleset on `main` (the user's choice): merge only when every check is green.
- [x] 19c. **Stricter lint:** `strictTypeChecked`, `switch-exhaustiveness-check`, `@eslint-react/eslint-plugin`. `only-throw-error` allows the router's `notFound()` and `redirect()`.
- [x] 19d. **Knip:** finds unused files, exports and dependencies; in CI.
- [x] 19e. **Accessibility checks:** `eslint-plugin-jsx-a11y-x` (`strict`) and an axe scan of every page in `e2e/accessibility.spec.ts`. Every new page is added to that list.
- [x] 19f. **Accessibility in the app:** skip link, one `<main>` in `__root.tsx`, focus moves to the new `<h1>` after client-side navigation (only on a path change), not-found page title. _Test:_ `e2e/keyboard.spec.ts`.

## Phase D — Styling

- [x] 20. **Tailwind v4 with light and dark colours:** colour roles (shadcn names) as `light-dark()` in oklch, following the system setting. `prettier-plugin-tailwindcss` and `eslint-plugin-better-tailwindcss`. _Test:_ axe scans both colour schemes.
- [x] 20b. **Colour palettes:** five palettes in `src/styles/palettes.css`, chosen by the typed `palette` constant in `src/lib/palette.ts`. _Test:_ CSS and TS lists match, every palette defines every role, axe scans every palette.
- [x] 21. **shadcn/ui setup:** `components.json` (`aria-nova`, React Aria base), `cn()` from the `cn` package, and a hand-written `Button` (44px default, our focus outline, no `destructive` yet). _Test:_ Button component test; `CookingTip` example on the home page.
- [x] 22. **Layout and theme:** `Header.tsx` with nav and a Light/Dark toggle (no "System" option, the user's choice). The choice is saved in `localStorage` and applied by an inline script before first paint; with no choice the page follows the system. `dark:` follows the choice. Each palette got its own `--ring` focus colour, contrast-checked in a unit test with `colorjs.io`. A cookie for server-rendered theme was left for later. _Test:_ unit, component and e2e (survives reload, no flash, keyboard).
- [x] 22b. **Bundle size:** `rollup-plugin-visualizer` writes `bundle-report/treemap.html` for the client build. `pnpm size` (`scripts/bundle-size/`, TypeScript run directly by Node 24) lists each .js/.css file's raw and Brotli size and fails above the budget in `budget.ts` (200 kB JS, 10 kB CSS, compressed). The `Bundle size` workflow comments a comparison against `main` on every pull request. _Test:_ unit tests for measuring, the budget check and the report. _(Added after step 22, at the user's request.)_

## Phase E — Database

- [x] 23. **Drizzle and SQLite connection:** `drizzle-orm` 0.45, `@libsql/client` 0.18, `drizzle-kit` 0.31 (Drizzle 1.0 is still a release candidate). `src/server/db/client.ts` has two plain functions: `databaseConfigFromEnv(env)` reads `DATABASE_URL` and the optional `DATABASE_AUTH_TOKEN` (Turso's), and `createDb(config)`; no shared `db` until step 28. `drizzle.config.ts` uses the `turso` dialect (works for files too, and sends the token). No `dotenv`: drizzle-kit and Nitro's dev server load `.env`. `allowBuilds: esbuild: false` in `pnpm-workspace.yaml`. _Test:_ `databaseConfigFromEnv` test-first; `createDb` against `:memory:` and a temporary file.
- [ ] 24. **The first table:** `recipes` schema, `db:generate` and `db:migrate`. _Test:_ an in-memory test database helper that runs the migrations, and an insert/read test.
- [ ] 25. **Related tables:** `ingredients`, `steps`, `tags`, `recipe_tags` with relations; second migration. _Test:_ relational query; delete cascades.
- [ ] 26. **Seed script:** `src/server/db/seed.ts` (~12 recipes), `db:seed`. _Test:_ expected counts.
- [ ] 27. **Production database on Turso:** the user creates it; `DATABASE_URL` and `DATABASE_AUTH_TOKEN` go into Vercel's env settings. Migrate and seed it, and decide how future migrations run on deploy.

## Phase F — Reading data: React Query and server functions

- [ ] 28. **`getRecipes` server function:** rendered straight from a loader. _Test:_ `listRecipes(db)`; e2e that the home page lists seeded recipes.
- [ ] 29. **Adding React Query:** `QueryClient` in router context, SSR integration, Devtools. _Test:_ existing tests pass unchanged.
- [ ] 30. **`queryOptions` factories:** `src/lib/queries/recipes.ts`, `ensureQueryData` + `useSuspenseQuery`, `@tanstack/eslint-plugin-query`. _Test:_ query key shape.
- [ ] 31. **Recipe card UI:** `RecipeCard` with shadcn `Card` and `Badge`. _Test:_ component test; extend the list e2e.
- [ ] 32. **Recipe detail route:** `recipes/$recipeId.tsx`, `getRecipe`, `notFound`/`pendingComponent`/`errorComponent`. _Test:_ `getRecipeById(db, id)`; e2e for opening a card and an unknown id (including its page title).
- [ ] 33. **Servings scaler:** pure `scale()` and local state. _Test first:_ `scale()` unit tests, then component and e2e.

## Phase G — Search state in the URL

- [ ] 34. **Validated search params:** Zod `validateSearch` for `q`, `tag`, `sort`, `page`. _Test:_ schema defaults and fallbacks; e2e with bad params.
- [ ] 35. **Debounced search input:** updates the URL, survives a reload. _Test:_ e2e.
- [ ] 36. **Tag filter, sort and pagination:** via `loaderDeps`. _Test:_ `listRecipes(db, filters)`; e2e including the back button.

## Phase H — Writing data: forms and mutations

- [ ] 37. **Shared Zod schemas:** `drizzle-zod` and `recipeInputSchema`. _Test:_ valid and invalid input.
- [ ] 38. **`createRecipe` server function:** with a Zod `.validator()`. _Test:_ `insertRecipe(db, input)`.
- [ ] 39. **New recipe form:** TanStack Form for the basic fields, with field errors. _Test:_ component and e2e for `/recipes/new`.
- [ ] 40. **Ingredient and step lists:** field arrays (add, remove, reorder). _Test:_ component test.
- [ ] 41. **Submit via `useMutation`:** invalidate, navigate, toast (sonner). _Test:_ e2e create flow.
- [ ] 42. **Edit and delete:** reuse the form, confirm dialog. _Test:_ `updateRecipe`/`deleteRecipe`; e2e.
- [ ] 43. **Optimistic favorite toggle:** `onMutate`, rollback in `onError`, `onSettled`. _Test:_ e2e reload, and a failed request via `page.route`.

## Phase I — Meal planner and shopping list

- [ ] 44. **Planner schema and server functions:** `meal_plan_entries`, `getWeekPlan`, `setMeal`. _Test first:_ week date helpers, then the DB functions.
- [ ] 45. **Planner grid UI:** `/planner?week=`, 7 days × 3 slots, week navigation. _Test:_ component and e2e.
- [ ] 46. **Pick a recipe for a slot:** dialog with search and a mutation. _Test:_ e2e.
- [ ] 47. **Shopping list logic:** pure `aggregateIngredients()`. _Test first:_ combining, units, empty week.
- [ ] 48. **Shopping list page:** checkboxes saved in `shopping_checks`. _Test:_ e2e reload.
- [ ] 49. **Home page:** this week's meals and featured recipes. _Test:_ update the e2e.

## Phase J — Testing wrap-up

- [ ] 50. **End-to-end flow:** create a recipe, plan it, see it on the shopping list.
- [ ] 51. **Coverage:** `@vitest/coverage-v8`, `test:coverage` in CI; fill one real gap.

## Phase K — Deployment wrap-up

- [ ] 52. **Smoke tests on preview deploys:** a CI job runs read-only Playwright tests against the pull request's Vercel preview.
- [ ] 53. **README:** setup, scripts, env vars, deploys, CI badge, and which file shows which technology.
- [ ] 54. **Final check:** `pnpm build && pnpm start` locally, then click through production.

---

## Verification (every step)

- The step's own check, plus every CI check (`typecheck`, `lint`, `format:check`, `test`, `knip`, `lint:secrets`, `build`).
- `pnpm test:e2e` when what a user sees or does changes.
- CI is green on the pull request, and the Vercel preview works.
