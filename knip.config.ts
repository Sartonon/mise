import type { KnipConfig } from 'knip'

// Knip finds files nothing imports, exports nothing uses, and packages in package.json
// that no code needs (and code that uses a package that isn't in package.json).
// It reads the configs of the tools we use (Vite, Vitest, Playwright, ESLint, lint-staged...)
// to know where the entry points are, so this file only lists what it can't work out.
const config: KnipConfig = {
  // secretlint loads its rules by name from .secretlintrc.json, which Knip doesn't read.
  ignoreDependencies: ['@secretlint/secretlint-rule-preset-recommend'],
}

export default config
