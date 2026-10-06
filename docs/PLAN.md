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

For each step I will:
1. Explain what we're adding and why.
2. Write the code, keeping each file short.
3. Run a check so we can see that it works.
4. Walk through the key lines.
5. Commit with a message that names the step (for example `step 07: add prettier`).
6. **Stop and wait** for the user's questions or a "next" before starting the next step.

Wherever possible we build things by hand instead of using a scaffolder, so that nothing appears without an explanation. Before each step that adds packages, I'll check their current versions and APIs in the docs, because TanStack Start changes quickly.

---

## Phase A — Repository foundation
- [x] 1. **Git and the basics:** run `git init`, then add `.gitignore`, `.editorconfig`, `.nvmrc` (24) and a stub `README.md`. *Learn: why each file exists.*
- [ ] 2. **pnpm package:** add a minimal `package.json` (`"type": "module"`, `packageManager`, `engines`) and `.npmrc` (`engine-strict`). *Learn: what pnpm does differently (content-addressed store, strict `node_modules`, lockfile).*
- [ ] 3. **TypeScript:** install `typescript`, write a strict `tsconfig.json` (`noUncheckedIndexedAccess`, `verbatimModuleSyntax`, path alias `~/*`) and add a `typecheck` script. Add a tiny `src/hello.ts` to see type errors in action, then delete it.

## Phase B — Code quality tooling
- [ ] 4. **Prettier:** add `prettier.config.js`, `.prettierignore`, and `format` and `format:check` scripts.
- [ ] 5. **ESLint base:** a flat config `eslint.config.js` using `@eslint/js` and `typescript-eslint` (type-checked rules), plus a `lint` script.
- [ ] 6. **ESLint and Prettier together:** add `eslint-config-prettier`. *Learn: why linting and formatting are kept separate.* (The React and TanStack lint plugins come later, when we have that code.)
- [ ] 7. **Git hooks:** Husky with a `pre-commit` hook that runs lint-staged. We'll make a deliberately badly formatted commit to watch the hook fix it.

## Phase C — The first page with TanStack Start
- [ ] 8. **Vite and React:** install `react`, `react-dom`, `vite`, `@vitejs/plugin-react` and `@tanstack/react-start`, then write `vite.config.ts`.
- [ ] 9. **The router and root route:** `src/router.tsx` and `src/routes/__root.tsx` (the HTML shell). *Learn: file-based routing and the generated `routeTree.gen.ts`.*
- [ ] 10. **The first page:** `src/routes/index.tsx` showing "Hello, Mise". Run `pnpm dev` and view it in the browser. Add `dev`, `build` and `start` scripts.
- [ ] 11. **A second route and links:** an `/about` page and a `<Link>` nav bar. *Learn: type-safe links (try linking to a route that doesn't exist).*
- [ ] 12. **The first server function:** `createServerFn` that returns the server time, called from a route `loader`. *Learn: SSR, what runs on the server and what runs on the client, and Node.js inside Start.*
- [ ] 13. **ESLint for React:** add `eslint-plugin-react-hooks` and `@tanstack/eslint-plugin-router`.

## Phase D — Styling
- [ ] 14. **Tailwind v4:** `@tailwindcss/vite`, `src/styles/app.css`, and Tailwind classes on the layout. Add `prettier-plugin-tailwindcss` so class names get sorted.
- [ ] 15. **shadcn/ui setup:** `components.json`, `cn()` in `src/lib/utils.ts`, and the first component, `Button`. *Learn: shadcn copies component code into your project instead of installing it as a dependency.*
- [ ] 16. **Layout and theme:** a header with navigation, plus a light/dark theme toggle.

## Phase E — Database
- [ ] 17. **Drizzle and SQLite connection:** install `drizzle-orm`, `@libsql/client` and `drizzle-kit`, then write `src/server/db/client.ts` and `drizzle.config.ts`.
- [ ] 18. **The first table:** the `recipes` schema only. Then `db:generate` and `db:migrate`, and look at the SQL it generates.
- [ ] 19. **Related tables:** `ingredients`, `steps`, `tags` and `recipe_tags` with relations, and a second migration. *Learn: how migrations evolve over time.*
- [ ] 20. **Seed script:** `src/server/db/seed.ts` with about 12 recipes and a `db:seed` script.

## Phase F — Reading data: React Query and server functions
- [ ] 21. **Server function `getRecipes`:** reads from the database, and we render the result directly from a loader (no React Query yet).
- [ ] 22. **Adding React Query:** a `QueryClient` in the router context, the SSR integration and Devtools.
- [ ] 23. **`queryOptions` factories:** `src/lib/queries/recipes.ts`, and query key conventions. Change the list to use `ensureQueryData` and `useSuspenseQuery`. *Learn: why we prefetch in the loader and then read the data in the component.* Add `@tanstack/eslint-plugin-query`.
- [ ] 24. **Recipe card UI:** `RecipeCard` plus shadcn `Card` and `Badge`.
- [ ] 25. **Recipe detail route:** `recipes/$recipeId.tsx`, a `getRecipe` server function, and `notFound`, `pendingComponent` and `errorComponent`.
- [ ] 26. **Servings scaler:** a pure `scale.ts` function and local UI state.

## Phase G — Search state in the URL
- [ ] 27. **Validated search params:** use Zod in `validateSearch` for `q`, `tag`, `sort` and `page`.
- [ ] 28. **Search input with debounce:** update the URL as the user types, and see that it survives a reload.
- [ ] 29. **Tag filter, sort and pagination:** these use `loaderDeps`, which reload data when search params change.

## Phase H — Writing data: forms and mutations
- [ ] 30. **Shared Zod schemas:** `drizzle-zod` and a `recipeInputSchema` that both the client and the server use.
- [ ] 31. **The `createRecipe` server function:** add a server-side `.validator()` with Zod.
- [ ] 32. **New recipe form (basic fields):** TanStack Form for title, description, servings and times, with field-level errors.
- [ ] 33. **Dynamic ingredient and step lists:** field arrays for adding, removing and reordering.
- [ ] 34. **Submit via `useMutation`:** invalidate the cache, navigate to the new recipe and show a toast (sonner).
- [ ] 35. **Edit and delete recipe:** reuse the form, and add a confirm dialog.
- [ ] 36. **Optimistic favorite toggle:** `onMutate`, rollback in `onError`, then `onSettled`. We'll add a temporary forced failure to watch the rollback.

## Phase I — Meal planner and shopping list
- [ ] 37. **Planner schema and server functions:** the `meal_plan_entries` table, plus `getWeekPlan` and `setMeal`.
- [ ] 38. **Planner grid UI:** `/planner?week=` shows 7 days × 3 slots, with previous and next week controls.
- [ ] 39. **Pick a recipe for a slot:** a dialog with recipe search, a mutation, and cache invalidation.
- [ ] 40. **Shopping list logic:** a pure `aggregateIngredients()` function that combines ingredients by name and unit.
- [ ] 41. **Shopping list page:** a checkbox list, with checked items saved in a `shopping_checks` table.
- [ ] 42. **Home page:** this week's meals and featured recipes.

## Phase J — Testing
- [ ] 43. **Vitest setup:** `vitest.config.ts`, then unit tests for `scale.ts`.
- [ ] 44. **More unit tests:** `aggregateIngredients()` and the Zod schemas.
- [ ] 45. **Component test:** `RecipeForm` with Testing Library and `user-event`.
- [ ] 46. **Playwright setup:** `playwright.config.ts` with `webServer` and a test database, then a smoke test.
- [ ] 47. **End-to-end flow:** create a recipe, add it to the planner and check that it appears on the shopping list.

## Phase K — CI and wrap-up
- [ ] 48. **GitHub Actions:** `.github/workflows/ci.yml` runs install with the pnpm cache, then typecheck, lint, format check, test and build.
- [ ] 49. **Playwright in CI:** a separate job that installs browsers and uploads the report.
- [ ] 50. **README:** setup instructions, all the scripts, and a table showing which file demonstrates which technology.
- [ ] 51. **Production build:** run `pnpm build && pnpm start` and do a final click-through.

---

## Verification (we repeat these as we go)
- **Every step:** its own check (the type error appears, the lint rule fires, the page renders, the migration SQL looks right, and so on), plus `pnpm typecheck` and `pnpm lint` once those exist.
- **From step 10:** check the UI in the built-in browser.
- **From step 43:** `pnpm test`.
- **Final:** `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e` all pass, and the pre-commit hook runs on commit.
