# Plan: "Mise" — Recipe & Meal Planner, built in small steps

> **Progress:** tick a step's box (`- [x]`) in the same commit that finishes it.
> The first unticked step is the next one to do.

## Context
The user wants a demo app that shows modern web development in one codebase: TypeScript, React, TanStack Start, Node.js, React Query, Prettier, ESLint and pnpm. Developed with Node v24 and pnpm 11.

The user chose:
- **Idea:** a recipe and meal planner
- **Data:** SQLite with Drizzle ORM (using `@libsql/client`)
- **Extras:** Tailwind v4 + shadcn/ui, Zod + TanStack Form, Vitest + Testing Library + Playwright, and Husky + lint-staged + GitHub Actions CI

**How we'll work:** the user wants to follow along and understand every piece. So the app is built in **small steps, one at a time**. Each step adds only a few files.

**Testing from the start:** the test tools are set up early (Vitest in step 4, component tests in step 12, Playwright in step 13). After that, **every step that adds logic or UI also adds or extends a test**, shown as a *Test:* note on the step. For pure functions we write the test first (red → green). **From step 13 on, every step that adds or changes something a user can see or do also gets a Playwright e2e test** (or extends one) for that flow. Unit and component tests cover the details; e2e tests prove the real app works in a real browser. Server logic lives in plain functions that the server functions call, so it can be tested against an in-memory database.

For each step I will:
1. Explain what we're adding and why.
2. Write the code (and its test), keeping each file short.
3. Run a check so we can see that it works, including `pnpm test` once it exists.
4. Walk through the key lines.
5. Commit with a message that names the step (for example `step 07: add prettier`).
6. **Stop and wait** for the user's questions or a "next" before starting the next step.

Wherever possible we build things by hand instead of using a scaffolder, so that nothing appears without an explanation. Before each step that adds packages, I'll check their current versions and APIs in the docs, because TanStack Start changes quickly.

---

## Phase A — Repository foundation
- [x] 1. **Git and the basics:** run `git init`, then add `.gitignore`, `.editorconfig`, `.nvmrc` (24) and a stub `README.md`. *Learn: why each file exists.*
- [x] 2. **pnpm package:** add a minimal `package.json` (`"type": "module"`, `packageManager`, `engines`) and `pnpm-workspace.yaml` (`engineStrict: true`). *(Updated: pnpm 11 only reads auth/registry settings from `.npmrc`, so other settings go in `pnpm-workspace.yaml`.)* *Learn: what pnpm does differently (content-addressed store, strict `node_modules`, lockfile).*
- [x] 3. **TypeScript:** install `typescript`, write a strict `tsconfig.json` (`noUncheckedIndexedAccess`, `verbatimModuleSyntax`, path alias `~/*`) and add a `typecheck` script. Add a tiny `src/hello.ts` to see type errors in action, then delete it. *(TypeScript 7 has no JS API yet, and `typescript-eslint` needs one. Following the TS 7.0 announcement, we install both: `@typescript/native` → `typescript@^7` gives the fast `tsc` used by `typecheck`, and `typescript` → `@typescript/typescript6@~6.0.2` (command `tsc6`) gives tools the TS 6 API. Revisit when TS 7.1 ships its new API. Until step 4 adds the first `.ts` files, `pnpm typecheck` reports "No inputs were found".)*
- [ ] 4. **Vitest:** install `vitest`, write `vitest.config.ts` (with the `~/*` alias), and add `test` and `test:watch` scripts. Write the first test **before** the code: a tiny pure `slugify()` in `src/lib/slugify.ts` (we'll use it for recipe URLs). Watch it fail, then make it pass. *Learn: `describe`/`it`/`expect`, watch mode, red → green.*

## Phase B — Code quality tooling
- [ ] 5. **Prettier:** add `prettier.config.js`, `.prettierignore`, and `format` and `format:check` scripts.
- [ ] 6. **ESLint base:** a flat config `eslint.config.js` using `@eslint/js` and `typescript-eslint` (type-checked rules), plus a `lint` script. Add `@vitest/eslint-plugin` for test files.
- [ ] 7. **ESLint and Prettier together:** add `eslint-config-prettier`. *Learn: why linting and formatting are kept separate.* (The React and TanStack lint plugins come later, when we have that code.)
- [ ] 8. **Git hooks:** Husky with a `pre-commit` hook that runs lint-staged (format, lint, and `vitest related --run` for the changed files). We'll make a deliberately badly formatted commit to watch the hook fix it, and a commit with a broken test to watch it get blocked.

## Phase C — The first page with TanStack Start
- [ ] 9. **Vite and React:** install `react`, `react-dom`, `vite`, `@vitejs/plugin-react` and `@tanstack/react-start`, then write `vite.config.ts`. Decide whether Vitest keeps its own config or shares this one, and check that `pnpm test` still passes.
- [ ] 10. **The router and root route:** `src/router.tsx` and `src/routes/__root.tsx` (the HTML shell). *Learn: file-based routing and the generated `routeTree.gen.ts`.*
- [ ] 11. **The first page:** `src/routes/index.tsx` showing "Hello, Mise". Run `pnpm dev` and view it in the browser. Add `dev`, `build` and `start` scripts.
- [ ] 12. **Component tests:** add `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` and a DOM environment (`jsdom` or `happy-dom`) to Vitest. Move the page's content into a small component and test that it renders "Hello, Mise". *Learn: query by role and text, the way a user finds things.*
- [ ] 13. **Playwright:** `playwright.config.ts` with `webServer` (starts the app for the tests) and a `test:e2e` script. A smoke test opens `/` and sees "Hello, Mise". *Learn: unit vs component vs end-to-end tests, and what each one is for.*
- [ ] 14. **A second route and links:** an `/about` page and a `<Link>` nav bar. *Learn: type-safe links (try linking to a route that doesn't exist).* *Test:* e2e test that clicks the nav link and lands on `/about`.
- [ ] 15. **The first server function:** `createServerFn` that returns the server time, called from a route `loader`. *Learn: SSR, what runs on the server and what runs on the client, and Node.js inside Start.* *Test:* extend the smoke test to check that server-rendered content is in the HTML.
- [ ] 16. **ESLint for React and tests:** add `eslint-plugin-react-hooks`, `@tanstack/eslint-plugin-router`, `eslint-plugin-testing-library` and `eslint-plugin-playwright`.

## Phase D — Styling
- [ ] 17. **Tailwind v4:** `@tailwindcss/vite`, `src/styles/app.css`, and Tailwind classes on the layout. Add `prettier-plugin-tailwindcss` so class names get sorted.
- [ ] 18. **shadcn/ui setup:** `components.json`, `cn()` in `src/lib/utils.ts`, and the first component, `Button`. *Learn: shadcn copies component code into your project instead of installing it as a dependency.* *Test:* unit tests for `cn()` (merging conflicting classes).
- [ ] 19. **Layout and theme:** a header with navigation, plus a light/dark theme toggle. *Test:* component test that clicking the toggle switches the theme; e2e test that the chosen theme survives a reload and the header links work.

## Phase E — Database
- [ ] 20. **Drizzle and SQLite connection:** install `drizzle-orm`, `@libsql/client` and `drizzle-kit`, then write `src/server/db/client.ts` and `drizzle.config.ts`.
- [ ] 21. **The first table:** the `recipes` schema only. Then `db:generate` and `db:migrate`, and look at the SQL it generates. *Test:* a test helper that creates an in-memory SQLite database and runs the migrations, plus a first test that inserts and reads a recipe.
- [ ] 22. **Related tables:** `ingredients`, `steps`, `tags` and `recipe_tags` with relations, and a second migration. *Learn: how migrations evolve over time.* *Test:* a relational query returns a recipe with its ingredients and tags; deleting a recipe cascades.
- [ ] 23. **Seed script:** `src/server/db/seed.ts` with about 12 recipes and a `db:seed` script. *Test:* seeding the test database gives the expected counts.

## Phase F — Reading data: React Query and server functions
- [ ] 24. **Server function `getRecipes`:** reads from the database, and we render the result directly from a loader (no React Query yet). *Test:* the query function `listRecipes(db)` against the test database; e2e test that the home page lists seeded recipes.
- [ ] 25. **Adding React Query:** a `QueryClient` in the router context, the SSR integration and Devtools. *Test:* the existing unit and e2e tests still pass unchanged (this is a refactor; that's what the tests are for).
- [ ] 26. **`queryOptions` factories:** `src/lib/queries/recipes.ts`, and query key conventions. Change the list to use `ensureQueryData` and `useSuspenseQuery`. *Learn: why we prefetch in the loader and then read the data in the component.* Add `@tanstack/eslint-plugin-query`. *Test:* unit test that the query keys have the expected shape.
- [ ] 27. **Recipe card UI:** `RecipeCard` plus shadcn `Card` and `Badge`. *Test:* component test that the card shows the title, time and tags; extend the list e2e test to check a card's content.
- [ ] 28. **Recipe detail route:** `recipes/$recipeId.tsx`, a `getRecipe` server function, and `notFound`, `pendingComponent` and `errorComponent`. *Test:* `getRecipeById(db, id)` returns the recipe or `undefined`; e2e test that clicking a card opens the detail page and an unknown id shows "not found".
- [ ] 29. **Servings scaler:** a pure `scale.ts` function and local UI state. *Test first:* unit tests for `scale()` (doubling, halving, rounding), then a component test for the +/− buttons, and an e2e test that changing servings on a recipe page updates the ingredient amounts.

## Phase G — Search state in the URL
- [ ] 30. **Validated search params:** use Zod in `validateSearch` for `q`, `tag`, `sort` and `page`. *Test:* unit tests for the search schema (defaults, invalid values fall back); e2e test that opening a URL with bad params still shows the list with defaults.
- [ ] 31. **Search input with debounce:** update the URL as the user types, and see that it survives a reload. *Test:* e2e test that typing updates the URL and the list, and a reload keeps them.
- [ ] 32. **Tag filter, sort and pagination:** these use `loaderDeps`, which reload data when search params change. *Test:* `listRecipes(db, filters)` tests for each filter, sort and page; e2e tests for clicking a tag, changing the sort and paging, including the browser back button.

## Phase H — Writing data: forms and mutations
- [ ] 33. **Shared Zod schemas:** `drizzle-zod` and a `recipeInputSchema` that both the client and the server use. *Test:* unit tests for valid and invalid recipe input.
- [ ] 34. **The `createRecipe` server function:** add a server-side `.validator()` with Zod. *Test:* `insertRecipe(db, input)` writes the recipe with its ingredients and steps.
- [ ] 35. **New recipe form (basic fields):** TanStack Form for title, description, servings and times, with field-level errors. *Test:* component test that submitting empty fields shows the errors; e2e test that `/recipes/new` opens from the nav and shows the errors in the real browser.
- [ ] 36. **Dynamic ingredient and step lists:** field arrays for adding, removing and reordering. *Test:* component test for adding and removing ingredient rows.
- [ ] 37. **Submit via `useMutation`:** invalidate the cache, navigate to the new recipe and show a toast (sonner). *Test:* e2e test that creates a recipe and sees it on its detail page and in the list.
- [ ] 38. **Edit and delete recipe:** reuse the form, and add a confirm dialog. *Test:* `updateRecipe`/`deleteRecipe` against the test database; e2e test for edit and delete.
- [ ] 39. **Optimistic favorite toggle:** `onMutate`, rollback in `onError`, then `onSettled`. We'll add a temporary forced failure to watch the rollback. *Test:* e2e test that a favorite survives a reload; Playwright's `page.route` makes the request fail so we can watch the rollback in a test too.

## Phase I — Meal planner and shopping list
- [ ] 40. **Planner schema and server functions:** the `meal_plan_entries` table, plus `getWeekPlan` and `setMeal`. *Test first:* week date helpers (start of week, next/previous week); then `getWeekPlan`/`setMeal` against the test database.
- [ ] 41. **Planner grid UI:** `/planner?week=` shows 7 days × 3 slots, with previous and next week controls. *Test:* component test that the grid renders 21 slots; e2e test for week navigation.
- [ ] 42. **Pick a recipe for a slot:** a dialog with recipe search, a mutation, and cache invalidation. *Test:* e2e test that picks a recipe and sees it in the slot.
- [ ] 43. **Shopping list logic:** a pure `aggregateIngredients()` function that combines ingredients by name and unit. *Test first:* unit tests for combining, different units, and an empty week.
- [ ] 44. **Shopping list page:** a checkbox list, with checked items saved in a `shopping_checks` table. *Test:* e2e test that a checked item stays checked after a reload.
- [ ] 45. **Home page:** this week's meals and featured recipes. *Test:* update the home page e2e test.

## Phase J — Testing wrap-up
- [ ] 46. **End-to-end flow:** one Playwright test for the whole story: create a recipe, add it to the planner and check that it appears on the shopping list.
- [ ] 47. **Coverage:** `@vitest/coverage-v8` and a `test:coverage` script. Look at the report together and fill one real gap.

## Phase K — CI and wrap-up
- [ ] 48. **GitHub Actions:** `.github/workflows/ci.yml` runs install with the pnpm cache, then typecheck, lint, format check, test and build.
- [ ] 49. **Playwright in CI:** a separate job that installs browsers and uploads the report.
- [ ] 50. **README:** setup instructions, all the scripts, and a table showing which file demonstrates which technology.
- [ ] 51. **Production build:** run `pnpm build && pnpm start` and do a final click-through.

---

## Verification (we repeat these as we go)
- **Every step:** its own check (the type error appears, the lint rule fires, the page renders, the migration SQL looks right, and so on), plus `pnpm typecheck`, `pnpm lint` and `pnpm test` once those exist.
- **From step 11:** check the UI in the built-in browser.
- **From step 13:** `pnpm test:e2e` on every step that changes what a user sees or does, with a new or extended e2e test for that flow.
- **Final:** `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e` all pass, and the pre-commit hook runs on commit.
