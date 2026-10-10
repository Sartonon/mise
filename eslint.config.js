import js from '@eslint/js'
import eslintReact from '@eslint-react/eslint-plugin'
import pluginRouter from '@tanstack/eslint-plugin-router'
import vitest from '@vitest/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import betterTailwind from 'eslint-plugin-better-tailwindcss'
import jsxA11y from 'eslint-plugin-jsx-a11y-x'
import playwright from 'eslint-plugin-playwright'
import reactHooks from 'eslint-plugin-react-hooks'
import testingLibrary from 'eslint-plugin-testing-library'
import tseslint from 'typescript-eslint'

// A "flat config": a list of config objects. For each file, ESLint merges every
// object whose `files` match it (an object with no `files` applies to all files).
export default defineConfig(
  // Files ESLint never looks at. Unlike Prettier, ESLint doesn't read .gitignore,
  // so build output has to be listed here too.
  globalIgnores(['dist/', '.output/', '.vercel/', 'src/routeTree.gen.ts']),

  // ESLint's own recommended rules for plain JavaScript mistakes.
  js.configs.recommended,

  // typescript-eslint's strict rules, including the ones that need type information
  // (for example, a Promise that is never awaited, a `?.` on a value that can't be
  // undefined, or a call to a function marked @deprecated).
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        // Ask TypeScript for the types, using the tsconfig.json that covers each file.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Numbers in template strings are fine (`${count} recipes`). Objects and
      // undefined still aren't: they'd print "[object Object]" or "undefined".
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // A `switch` over a union type must handle every member, so adding a new
      // member (say, a new meal slot) points at every switch that needs a new case.
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      // Only throw Error objects, except TanStack Router's `notFound()` and `redirect()`.
      // They are plain objects on purpose: the router catches them and shows the
      // not-found page or goes to another URL.
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            {
              from: 'package',
              package: '@tanstack/router-core',
              name: ['NotFoundError', 'Redirect'],
            },
          ],
        },
      ],
    },
  },

  // Our .js config files aren't part of tsconfig.json, so lint them without types.
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // React's rules of hooks (only call hooks at the top level of a component or hook),
  // plus the React Compiler's checks (for example, no setState directly in an effect).
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
  },

  // React mistakes that TypeScript doesn't catch: a list item without a `key`,
  // `{count && <p>...</p>}` (which shows a "0" when count is 0), a component defined
  // inside another component (it would be recreated, losing its state, on every render).
  {
    files: ['src/**/*.tsx'],
    extends: [eslintReact.configs['recommended-type-checked']],
    rules: {
      // These repeat rules from React's own plugin above. Keep React's version only,
      // so one mistake isn't reported twice.
      '@eslint-react/error-boundaries': 'off',
      '@eslint-react/exhaustive-deps': 'off',
      '@eslint-react/purity': 'off',
      '@eslint-react/rules-of-hooks': 'off',
      '@eslint-react/set-state-in-effect': 'off',
      '@eslint-react/set-state-in-render': 'off',
      '@eslint-react/static-components': 'off',
      '@eslint-react/unsupported-syntax': 'off',
      '@eslint-react/use-memo': 'off',
    },
  },

  // Accessibility in JSX: an <img> without `alt`, a <div onClick> that a keyboard can't
  // reach, a link with no text, a form field with no label... The strict preset, because
  // fixing these costs least while the markup is small.
  // (This is a maintained fork of eslint-plugin-jsx-a11y, which doesn't support ESLint 10.)
  {
    files: ['src/**/*.tsx'],
    extends: [jsxA11y.configs.strict],
    settings: {
      // TanStack Router's <Link> renders an <a>, so check it like one (for example,
      // that it has text a screen reader can read out).
      'jsx-a11y-x': { components: { Link: 'a' } },
    },
    rules: {
      // <Link> takes its address in `to`, not `href`.
      'jsx-a11y-x/anchor-is-valid': ['error', { components: ['Link'], specialLink: ['to'] }],
    },
  },

  // Tailwind classes: a class Tailwind doesn't know (a typo like `text-primay` would
  // otherwise just do nothing), two classes that set the same property (`p-2 p-4`), a class
  // built by joining strings (Tailwind can't find it in the code, so it never gets generated),
  // plus duplicates, deprecated names, and a longer spelling of a class that has a shorter
  // one. The plugin's other formatting rules are left out: Prettier sorts the classes.
  {
    files: ['src/**/*.tsx'],
    extends: [betterTailwind.configs.correctness],
    settings: {
      // Tailwind v4 is configured in CSS, so the plugin reads our stylesheet to learn our
      // own classes (like bg-primary).
      'better-tailwindcss': { entryPoint: 'src/styles/app.css' },
    },
    rules: {
      'better-tailwindcss/no-duplicate-classes': 'error',
      'better-tailwindcss/no-deprecated-classes': 'error',
      'better-tailwindcss/enforce-canonical-classes': 'error',
    },
  },

  // TanStack Router: route options must be in the order its type inference needs
  // (for example `validateSearch` before `loader`), and route params need valid names.
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [pluginRouter.configs['flat/recommended']],
  },

  // Extra rules for Vitest test files (for example, a test with no `expect` in it).
  {
    files: ['**/*.test.{ts,tsx}'],
    extends: [vitest.configs.recommended],
  },

  // Component tests: use Testing Library the way it's meant to be used
  // (for example, `screen` queries, and no poking at DOM nodes directly).
  {
    files: ['**/*.test.tsx'],
    extends: [testingLibrary.configs['flat/react']],
  },

  // Playwright tests (for example, an `expect` that is missing its `await`,
  // or a `page.waitForTimeout` that makes a test slow and flaky).
  {
    files: ['e2e/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
  },

  // Must stay last: turns off every rule above that is about formatting,
  // because Prettier decides formatting. ESLint only looks for bugs.
  eslintConfigPrettier,
)
