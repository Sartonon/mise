# Plan: "Mise" — Recipe & Meal Planner, built in small steps

> **Progress:** tick a step's box (`- [x]`) in the same commit that finishes it.
> The first unticked step is the next one to do.

## Context

The user wants a demo app that shows modern web development in one codebase: TypeScript, React, TanStack Start, Node.js, React Query, Prettier, ESLint and pnpm. Developed with Node v24 and pnpm 11.

The user chose:

- **Idea:** a recipe and meal planner
- **Data:** SQLite with Drizzle ORM (using `@libsql/client`): a local file in development and tests, and a hosted Turso database (also libSQL) in production
- **Extras:** Tailwind v4 + shadcn/ui, Zod + TanStack Form, Vitest + Testing Library + Playwright, and Husky + lint-staged + GitHub Actions CI
- **Hosting:** the code on GitHub, with deploys to Vercel

**How we'll work:** the user wants to follow along and understand every piece. So the app is built in **small steps, one at a time**. Each step adds only a few files.

**Testing from the start:** the test tools are set up early (Vitest in step 5, component tests in step 15, Playwright in step 16). After that, **every step that adds logic or UI also adds or extends a test**, shown as a _Test:_ note on the step. For pure functions we write the test first (red → green). **From step 16 on, every step that adds or changes something a user can see or do also gets a Playwright e2e test** (or extends one) for that flow. Unit and component tests cover the details; e2e tests prove the real app works in a real browser. Server logic lives in plain functions that the server functions call, so it can be tested against an in-memory database.

**GitHub and CI from the start:** the repo goes on GitHub in step 4, and GitHub Actions CI arrives in step 6. **CI grows with the project:** every step that adds a new check (format, lint, build, e2e) also adds it to the workflow. After each step's commit we push and watch CI go green.

**Deploying from the first page:** as soon as there's a page (step 14), the app deploys to Vercel. Pushing to `main` updates production, and pull requests get preview URLs. Before any page reads data, step 27 sets up the production database on Turso, because Vercel's servers can't keep a SQLite file between requests.

**Accounts:** the user creates and signs in to GitHub, Vercel and Turso themselves (`gh auth login`, the Vercel and Turso dashboards or CLIs). Claude never handles passwords or tokens. Secrets go into the Vercel and GitHub settings, never into the repo.

For each step I will:

1. Explain what we're adding and why.
2. Write the code (and its test), keeping each file short.
3. Run a check so we can see that it works, including `pnpm test` once it exists.
4. Walk through the key lines.
5. Commit with a message that names the step (for example `step 07: add prettier`), push, and check that CI (and, from step 14, the Vercel deploy) is green.
6. **Stop and wait** for the user's questions or a "next" before starting the next step.

Wherever possible we build things by hand instead of using a scaffolder, so that nothing appears without an explanation. Before each step that adds packages or services, I'll check their current versions and docs, because TanStack Start (and its deploy targets) change quickly.

---

## Phase A — Repository foundation

- [x] 1. **Git and the basics:** run `git init`, then add `.gitignore`, `.editorconfig`, `.nvmrc` (24) and a stub `README.md`. _Learn: why each file exists._
- [x] 2. **pnpm package:** add a minimal `package.json` (`"type": "module"`, `packageManager`, `engines`) and `pnpm-workspace.yaml` (`engineStrict: true`). _(Updated: pnpm 11 only reads auth/registry settings from `.npmrc`, so other settings go in `pnpm-workspace.yaml`.)_ _Learn: what pnpm does differently (content-addressed store, strict `node_modules`, lockfile)._
- [x] 3. **TypeScript:** install `typescript`, write a strict `tsconfig.json` (`noUncheckedIndexedAccess`, `verbatimModuleSyntax`, path alias `~/*`) and add a `typecheck` script. Add a tiny `src/hello.ts` to see type errors in action, then delete it. _(TypeScript 7 has no JS API yet, and `typescript-eslint` needs one. Following the TS 7.0 announcement, we install both: `@typescript/native` → `typescript@^7` gives the fast `tsc` used by `typecheck`, and `typescript` → `@typescript/typescript6@~6.0.2` (command `tsc6`) gives tools the TS 6 API. Revisit when TS 7.1 ships its new API. Until step 5 adds the first `.ts` files, `pnpm typecheck` reports "No inputs were found".)_
- [x] 4. **GitHub repository:** the user signs in with `gh auth login`, then we create the repo with `gh repo create` (decide public or private together), add it as the `origin` remote and push all the commits so far. _(Done: public repo https://github.com/Sartonon/mise, over SSH.)_ _Learn: remotes, `origin`, `git push -u`, and what lives locally vs on GitHub._
- [x] 5. **Vitest:** install `vitest`, write `vitest.config.ts` (with the `~/*` alias), and add `test` and `test:watch` scripts. Write the first test **before** the code: a tiny pure `slugify()` in `src/lib/slugify.ts` (we'll use it for recipe URLs). Watch it fail, then make it pass. _Learn: `describe`/`it`/`expect`, watch mode, red → green._ _(Updated: Vitest 5 lists `vite` as a required peer dependency, so `vite` is installed here instead of in step 11, along with `@types/node`. The alias comes from Vite's `resolve.tsconfigPaths: true`, which reads `tsconfig.json`, so `~/*` is defined in one place only.)_
- [x] 6. **GitHub Actions CI:** `.github/workflows/ci.yml` runs on every push and pull request: checkout, `pnpm/action-setup` (reads `packageManager`), `actions/setup-node` with `.nvmrc` and the pnpm cache, `pnpm install --frozen-lockfile`, then `typecheck` and `test`. Push, watch it go green, then push a deliberately failing test to watch it go red (and fix it). _Learn: workflows, jobs, steps, caching, and why CI uses a frozen lockfile._ _(Updated: it runs on pushes to `main` and on every pull request, not on every push to every branch, so a pull request's pushes don't run CI twice. Work reaches `main` through pull requests, so CI checks it there.)_

## Phase B — Code quality tooling

- [x] 7. **Prettier:** add `prettier.config.js`, `.prettierignore`, and `format` and `format:check` scripts. Add `format:check` to CI. _(Prettier also formats Markdown, so the first `pnpm format` restyled `CLAUDE.md` and this file: blank lines after headings, `_` for italics.)_
- [x] 8. **ESLint base:** a flat config `eslint.config.js` using `@eslint/js` and `typescript-eslint` (type-checked rules), plus a `lint` script. Add `@vitest/eslint-plugin` for test files. Add `lint` to CI. _(Installed ESLint 10 and typescript-eslint 8.71, which supports TypeScript `<6.1`. That is why step 3 kept the TS 6 API under the `typescript` name. The `.js` config files aren't in `tsconfig.json`, so they're linted without type information.)_
- [x] 9. **ESLint and Prettier together:** add `eslint-config-prettier`. _Learn: why linting and formatting are kept separate._ (The React and TanStack lint plugins come later, when we have that code.) _(Our current rule sets contain no formatting rules, so today it only turns off `no-unexpected-multiline`. It protects us when later plugins, or a hand-added style rule, bring formatting rules in.)_
- [x] 10. **Git hooks:** Husky with a `pre-commit` hook that runs lint-staged (format, lint, and `vitest related --run` for the changed files). We'll make a deliberately badly formatted commit to watch the hook fix it, and a commit with a broken test to watch it get blocked. _Learn: the hook is a fast local check, and CI is the one that can't be skipped._ _(Husky 9 needs no `husky init`: a `prepare` script runs `husky`, which points git's `core.hooksPath` at `.husky/_`, and `.husky/pre-commit` holds one line. `typecheck` stays in CI only, since `tsc` checks the whole project rather than single files.)_
- [x] 10b. **Secret scanning:** `secretlint` with `@secretlint/secretlint-rule-preset-recommend`, a `lint:secrets` script, a `secretlint` task for every staged file in lint-staged, and `lint:secrets` in CI. The user also turns on GitHub's push protection (Settings → Advanced Security). We'll stage a fake token to watch the commit get blocked. _Learn: a committed secret stays in git history, so it has to be revoked, not just deleted. That's why we catch it before the commit, again in CI, and again on GitHub._ _(Added after step 10, at the user's request.)_

## Phase C — The first page with TanStack Start

- [x] 11. **Vite and React:** install `react`, `react-dom`, `@vitejs/plugin-react` (`vite` is already there from step 5) and `@tanstack/react-start`, then write `vite.config.ts`. Decide whether Vitest keeps its own config or shares this one, and check that `pnpm test` still passes. _(Updated: Vitest keeps its own `vitest.config.ts`. Vitest prefers that file over `vite.config.ts`, and loading the Start plugin in unit tests fails until the app exists. `tsconfig.json` gets `"jsx": "react-jsx"`. `vite build` needs `src/router.tsx` (step 12), so adding `build` to CI moved to step 13, where the `build` script is added.)_
- [x] 12. **The router and root route:** `src/router.tsx` and `src/routes/__root.tsx` (the HTML shell). _Learn: file-based routing and the generated `routeTree.gen.ts`._ _(Also installs `@tanstack/react-router` directly, since our code imports it and pnpm only lets a package import its own dependencies. `routeTree.gen.ts` is committed so that `typecheck` works in CI without a build, and is excluded from Prettier and ESLint. ESLint now ignores `dist/`, `.output/` and the route tree with `globalIgnores`, because it doesn't read `.gitignore`.)_
- [x] 13. **The first page:** `src/routes/index.tsx` showing "Hello, Mise". Run `pnpm dev` and view it in the browser. Add `dev`, `build` and `start` scripts. Add `build` to CI. _(Updated: without a hosting adapter, `vite build` writes `dist/client` (browser files) and `dist/server/server.js`, which exports a `fetch` handler rather than starting a server. So `start` is `vite preview`, which serves that build with server rendering. Step 14 may change `start` when it adds the Vercel output.)_
- [x] 14. **Deploy to Vercel:** the user signs in to Vercel and imports the GitHub repo. We configure Start's build output for Vercel (check the current TanStack Start hosting docs), push, and open the production URL. Then open a small pull request to see a preview deployment. _Learn: what a serverless function is, how SSR runs on Vercel, and production vs preview deploys._ _(Updated: Start's hosting docs send Vercel users to Nitro. We install `nitro` (v3, still published only as a beta, so pinned to an exact version) and add `nitro()` to `vite.config.ts`. It needs no config: when the `VERCEL` env var is set, as on Vercel's build machines, it writes `.vercel/output/` (static files plus one `__server` function on Node 24, read from `engines`); anywhere else it writes a Node server to `.output/`. So `build` no longer writes `dist/`, and `start` becomes `node .output/server/index.mjs`. The step's own pull request is the "small pull request" that shows a preview deployment.)_
- [x] 15. **Component tests:** add `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` and a DOM environment (`jsdom` or `happy-dom`) to Vitest. Move the page's content into a small component and test that it renders "Hello, Mise". _Learn: query by role and text, the way a user finds things._ _(Chose `jsdom` over `happy-dom`, since it follows the web standards more closely, and Playwright covers real browsers. `@testing-library/dom` is installed directly because `@testing-library/react` lists it as a peer dependency. Vitest 5 dropped `environmentMatchGlobs`, so `vitest.config.ts` has two `projects`: `unit` (`*.test.ts`, Node) and `component` (`*.test.tsx`, jsdom, with `src/test/setup.ts` adding the jest-dom matchers and cleaning up after each test). `user-event` is installed now but first used in step 22.)_
- [x] 16. **Playwright:** `playwright.config.ts` with `webServer` (starts the app for the tests) and a `test:e2e` script. A smoke test opens `/` and sees "Hello, Mise". Add an e2e job to CI that installs the browsers and uploads the HTML report when a test fails. _Learn: unit vs component vs end-to-end tests, and what each one is for._ _(Tests live in `e2e/` (Vitest only reads `src/`). On CI, `webServer` runs `pnpm build && pnpm start`, so the tests hit the production build. Locally it runs `pnpm dev`, because the VS Code extension keeps its server running between runs, and a production build would go stale. Both use port 3100, not 3000, which `pnpm dev` uses by default. Chromium only for now, to keep CI fast. `webServer` uses `url`, since Playwright deprecated `port`. On CI: `forbidOnly`, one retry with a trace, and a `globalTimeout` instead of a job timeout, so the report is still written. The `e2e` job runs in parallel with `check` and uploads `playwright-report/` with `actions/upload-artifact@v7` only when it fails.)_
- [x] 17. **A second route and links:** an `/about` page and a `<Link>` nav bar. _Learn: type-safe links (try linking to a route that doesn't exist)._ _Test:_ e2e test that clicks the nav link and lands on `/about`. _(The nav bar is `src/components/NavBar.tsx`, rendered in `__root.tsx` outside `<Outlet />`. Home uses `activeOptions={{ exact: true }}`. The test also checks the page title and the `aria-current="page"` that `<Link>` sets on the current page's link, then clicks back to Home. The route tree only regenerates when Vite runs (`dev` or `build`), so `typecheck` doesn't see a new route until then.)_
- [x] 18. **The first server function:** `createServerFn` that returns the server time, called from a route `loader`. _Learn: SSR, what runs on the server and what runs on the client, and Node.js inside Start._ _Test:_ extend the smoke test to check that server-rendered content is in the HTML. Then look at the deployed page to see the time come from Vercel's servers. _(Following Start's file convention: `src/server/server-info.server.ts` holds the plain, server-only `getServerInfo()` (time, Node.js version, `VERCEL_REGION`) with its unit test, and `server-info.functions.ts` wraps it in `createServerFn({ method: 'GET' })`. The home page's loader calls it; `ServerInfoNote` shows it, with a component test. The time is shown as an ISO string, because formatting it in the browser's locale could differ from the server and break hydration. The e2e tests are in their own file, `e2e/server-function.spec.ts`: a plain `request.get('/')` finds the text in the HTML, and a client-side navigation from About to Home sends a request to `/_serverFn/`. That test waits for `<body data-hydrated>`, set from the router's `useHydrated()` in `__root.tsx`, because a click before hydration is a full page load.)_
- [x] 19. **ESLint for React and tests:** add `eslint-plugin-react-hooks`, `@tanstack/eslint-plugin-router`, `eslint-plugin-testing-library` and `eslint-plugin-playwright`. _(All four support ESLint 10. Each gets its own block in `eslint.config.js`: React Hooks 7 (rules of hooks plus the React Compiler checks) and the router's recommended rules on `src/`, Testing Library's `flat/react` on `*.test.tsx`, and Playwright's `flat/recommended` on `e2e/`. The existing code passed with no changes; throwaway files that broke one rule each showed every plugin firing. `pnpm lint` and the pre-commit hook run ESLint with `--max-warnings 0`, so a warning (like the router's property-order rule) fails CI and blocks a commit, instead of being printed and ignored.)_
- [x] 19c. **Stricter lint:** typescript-eslint's `strictTypeChecked` instead of `recommendedTypeChecked` (it adds rules like `no-deprecated`, useful while TanStack changes fast, and `no-unnecessary-condition`), with numbers allowed in template strings, plus `switch-exhaustiveness-check`. `only-throw-error` allows TanStack Router's `notFound()` and `redirect()`, which throw plain objects on purpose (step 32 would otherwise fail lint). `@eslint-react/eslint-plugin` (`recommended-type-checked`) on `src/**/*.tsx` catches what TypeScript doesn't: a list item without `key`, `{count && ...}` rendering a stray `0`. Its rules that repeat React's own hooks plugin are turned off. _(The older `eslint-plugin-react` doesn't support ESLint 10. The existing code passed unchanged; a throwaway file showed each new rule firing.)_ _(Added after step 19, at the user's request, with steps 19d–19f. Step 19b, CI and repo hardening, is in its own pull request.)_
- [x] 19d. **Knip:** finds files nothing imports, exports nothing uses, unused packages in `package.json`, and imports of packages that aren't in it. A `knip` script, `knip.config.ts`, and a CI step. Knip reads the configs of Vite, Vitest, Playwright, ESLint and lint-staged to find the entry points, so the config only ignores the secretlint preset (loaded by name from `.secretlintrc.json`). Its first run found `@testing-library/user-event`, unused since step 15, so it's removed and step 22 installs it. _Learn: dead code is cheapest to delete right after the change that made it dead._

## Phase D — Styling

- [ ] 20. **Tailwind v4:** `@tailwindcss/vite`, `src/styles/app.css`, and Tailwind classes on the layout. Add `prettier-plugin-tailwindcss` so class names get sorted.
- [ ] 21. **shadcn/ui setup:** `components.json`, `cn()` in `src/lib/utils.ts`, and the first component, `Button`. _Learn: shadcn copies component code into your project instead of installing it as a dependency._ _Test:_ unit tests for `cn()` (merging conflicting classes).
- [ ] 22. **Layout and theme:** a header with navigation, plus a light/dark theme toggle. Install `@testing-library/user-event` for the click (removed in step 19d until a test uses it). _Test:_ component test that clicking the toggle switches the theme; e2e test that the chosen theme survives a reload and the header links work.

## Phase E — Database

- [ ] 23. **Drizzle and SQLite connection:** install `drizzle-orm`, `@libsql/client` and `drizzle-kit`, then write `src/server/db/client.ts` and `drizzle.config.ts`. The connection comes from a `DATABASE_URL` env var (`file:local.db` locally), documented in `.env.example`. _Learn: env vars, and why the same code can talk to a local file or a remote database._
- [ ] 24. **The first table:** the `recipes` schema only. Then `db:generate` and `db:migrate`, and look at the SQL it generates. _Test:_ a test helper that creates an in-memory SQLite database and runs the migrations, plus a first test that inserts and reads a recipe.
- [ ] 25. **Related tables:** `ingredients`, `steps`, `tags` and `recipe_tags` with relations, and a second migration. _Learn: how migrations evolve over time._ _Test:_ a relational query returns a recipe with its ingredients and tags; deleting a recipe cascades.
- [ ] 26. **Seed script:** `src/server/db/seed.ts` with about 12 recipes and a `db:seed` script. _Test:_ seeding the test database gives the expected counts.
- [ ] 27. **Production database on Turso:** the user creates a Turso database. We put `DATABASE_URL` and `DATABASE_AUTH_TOKEN` into Vercel's env settings (production and preview), run the migrations and seed against it, and decide how future migrations run on deploy (for example a CI job on `main` that migrates first). _Learn: why a SQLite file doesn't work on serverless hosting, managing secrets, and keeping production in step with migrations._

## Phase F — Reading data: React Query and server functions

- [ ] 28. **Server function `getRecipes`:** reads from the database, and we render the result directly from a loader (no React Query yet). _Test:_ the query function `listRecipes(db)` against the test database; e2e test that the home page lists seeded recipes. Check that the production site lists the Turso recipes.
- [ ] 29. **Adding React Query:** a `QueryClient` in the router context, the SSR integration and Devtools. _Test:_ the existing unit and e2e tests still pass unchanged (this is a refactor; that's what the tests are for).
- [ ] 30. **`queryOptions` factories:** `src/lib/queries/recipes.ts`, and query key conventions. Change the list to use `ensureQueryData` and `useSuspenseQuery`. _Learn: why we prefetch in the loader and then read the data in the component._ Add `@tanstack/eslint-plugin-query`. _Test:_ unit test that the query keys have the expected shape.
- [ ] 31. **Recipe card UI:** `RecipeCard` plus shadcn `Card` and `Badge`. _Test:_ component test that the card shows the title, time and tags; extend the list e2e test to check a card's content.
- [ ] 32. **Recipe detail route:** `recipes/$recipeId.tsx`, a `getRecipe` server function, and `notFound`, `pendingComponent` and `errorComponent`. _Test:_ `getRecipeById(db, id)` returns the recipe or `undefined`; e2e test that clicking a card opens the detail page and an unknown id shows "not found".
- [ ] 33. **Servings scaler:** a pure `scale.ts` function and local UI state. _Test first:_ unit tests for `scale()` (doubling, halving, rounding), then a component test for the +/− buttons, and an e2e test that changing servings on a recipe page updates the ingredient amounts.

## Phase G — Search state in the URL

- [ ] 34. **Validated search params:** use Zod in `validateSearch` for `q`, `tag`, `sort` and `page`. _Test:_ unit tests for the search schema (defaults, invalid values fall back); e2e test that opening a URL with bad params still shows the list with defaults.
- [ ] 35. **Search input with debounce:** update the URL as the user types, and see that it survives a reload. _Test:_ e2e test that typing updates the URL and the list, and a reload keeps them.
- [ ] 36. **Tag filter, sort and pagination:** these use `loaderDeps`, which reload data when search params change. _Test:_ `listRecipes(db, filters)` tests for each filter, sort and page; e2e tests for clicking a tag, changing the sort and paging, including the browser back button.

## Phase H — Writing data: forms and mutations

- [ ] 37. **Shared Zod schemas:** `drizzle-zod` and a `recipeInputSchema` that both the client and the server use. _Test:_ unit tests for valid and invalid recipe input.
- [ ] 38. **The `createRecipe` server function:** add a server-side `.validator()` with Zod. _Test:_ `insertRecipe(db, input)` writes the recipe with its ingredients and steps.
- [ ] 39. **New recipe form (basic fields):** TanStack Form for title, description, servings and times, with field-level errors. _Test:_ component test that submitting empty fields shows the errors; e2e test that `/recipes/new` opens from the nav and shows the errors in the real browser.
- [ ] 40. **Dynamic ingredient and step lists:** field arrays for adding, removing and reordering. _Test:_ component test for adding and removing ingredient rows.
- [ ] 41. **Submit via `useMutation`:** invalidate the cache, navigate to the new recipe and show a toast (sonner). _Test:_ e2e test that creates a recipe and sees it on its detail page and in the list.
- [ ] 42. **Edit and delete recipe:** reuse the form, and add a confirm dialog. _Test:_ `updateRecipe`/`deleteRecipe` against the test database; e2e test for edit and delete.
- [ ] 43. **Optimistic favorite toggle:** `onMutate`, rollback in `onError`, then `onSettled`. We'll add a temporary forced failure to watch the rollback. _Test:_ e2e test that a favorite survives a reload; Playwright's `page.route` makes the request fail so we can watch the rollback in a test too.

## Phase I — Meal planner and shopping list

- [ ] 44. **Planner schema and server functions:** the `meal_plan_entries` table, plus `getWeekPlan` and `setMeal`. _Test first:_ week date helpers (start of week, next/previous week); then `getWeekPlan`/`setMeal` against the test database.
- [ ] 45. **Planner grid UI:** `/planner?week=` shows 7 days × 3 slots, with previous and next week controls. _Test:_ component test that the grid renders 21 slots; e2e test for week navigation.
- [ ] 46. **Pick a recipe for a slot:** a dialog with recipe search, a mutation, and cache invalidation. _Test:_ e2e test that picks a recipe and sees it in the slot.
- [ ] 47. **Shopping list logic:** a pure `aggregateIngredients()` function that combines ingredients by name and unit. _Test first:_ unit tests for combining, different units, and an empty week.
- [ ] 48. **Shopping list page:** a checkbox list, with checked items saved in a `shopping_checks` table. _Test:_ e2e test that a checked item stays checked after a reload.
- [ ] 49. **Home page:** this week's meals and featured recipes. _Test:_ update the home page e2e test.

## Phase J — Testing wrap-up

- [ ] 50. **End-to-end flow:** one Playwright test for the whole story: create a recipe, add it to the planner and check that it appears on the shopping list.
- [ ] 51. **Coverage:** `@vitest/coverage-v8` and a `test:coverage` script, also run in CI. Look at the report together and fill one real gap.

## Phase K — Deployment wrap-up

- [ ] 52. **Smoke tests against preview deploys:** a CI job that waits for a pull request's Vercel preview URL and runs the read-only Playwright smoke tests against it. _Learn: testing what actually ships, not just what runs locally._
- [ ] 53. **README:** setup instructions, all the scripts, the env vars, how deploys work, a CI badge, and a table showing which file demonstrates which technology.
- [ ] 54. **Final check:** run `pnpm build && pnpm start` locally, then do a final click-through on the production URL.

---

## Verification (we repeat these as we go)

- **Every step:** its own check (the type error appears, the lint rule fires, the page renders, the migration SQL looks right, and so on), plus `pnpm typecheck`, `pnpm lint` and `pnpm test` once those exist.
- **From step 6:** after pushing, CI is green on GitHub.
- **From step 13:** check the UI in the built-in browser.
- **From step 14:** the Vercel deploy succeeds and the production URL shows the change.
- **From step 16:** `pnpm test:e2e` on every step that changes what a user sees or does, with a new or extended e2e test for that flow.
- **Final:** `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e` all pass, the pre-commit hook runs on commit, CI is green, and production works.
