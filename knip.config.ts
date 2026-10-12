import type { KnipConfig } from 'knip'

// Knip finds files nothing imports, exports nothing uses, and packages in package.json
// that no code needs (and code that uses a package that isn't in package.json).
// It reads the configs of the tools we use (Vite, Vitest, Playwright, ESLint, lint-staged...)
// to know where the entry points are, so this file only lists what it can't work out.
// Knip loads drizzle.config.ts to find the schema files, and that config needs DATABASE_URL.
// Knip never connects to the database, so when the env doesn't set one (as in CI), any URL will do.
process.env.DATABASE_URL ??= ':memory:'

const config: KnipConfig = {
  // The record skill's config and script are run by hand (see its SKILL.md), never imported.
  entry: ['.claude/skills/record/*.ts'],
  // collect.ts runs the system's ffmpeg, which isn't an npm package.
  ignoreBinaries: ['ffmpeg'],
  // secretlint loads its rules by name from .secretlintrc.json, which Knip doesn't read.
  ignoreDependencies: ['@secretlint/secretlint-rule-preset-recommend'],
}

export default config
