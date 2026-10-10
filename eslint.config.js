import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

// A "flat config": a list of config objects. For each file, ESLint merges every
// object whose `files` match it (an object with no `files` applies to all files).
export default defineConfig(
  // Files ESLint never looks at. Unlike Prettier, ESLint doesn't read .gitignore,
  // so build output has to be listed here too.
  globalIgnores(["dist/", ".output/", ".vercel/", "src/routeTree.gen.ts"]),

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
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Extra rules for test files (for example, a test with no `expect` in it).
  {
    files: ["**/*.test.{ts,tsx}"],
    extends: [vitest.configs.recommended],
  },

  // Must stay last: turns off every rule above that is about formatting,
  // because Prettier decides formatting. ESLint only looks for bugs.
  eslintConfigPrettier,
);
