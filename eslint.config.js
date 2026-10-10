import js from '@eslint/js'
import pluginRouter from '@tanstack/eslint-plugin-router'
import vitest from '@vitest/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
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

  // typescript-eslint's recommended rules, including the ones that need type information
  // (for example, a Promise that is never awaited).
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        // Ask TypeScript for the types, using the tsconfig.json that covers each file.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
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
