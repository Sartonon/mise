# Lint examples (delete before merging)

Each file here breaks rules from one of the ESLint plugins added in step 19, on purpose.
Run `pnpm lint` to see them. They were committed with `--no-verify`, because the
pre-commit hook would have blocked them.

- `react-hooks.tsx`: `eslint-plugin-react-hooks`
- `router.tsx`: `@tanstack/eslint-plugin-router`
- `testing-library.test.tsx`: `eslint-plugin-testing-library`
- `../../e2e/lint-examples.ts`: `eslint-plugin-playwright` (not named `.spec.ts`, so Playwright doesn't run it)
