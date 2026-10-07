// Runs on `git commit`, only for the files staged in that commit.
// lint-staged adds the staged file paths to the end of each command.

/** @type {import("lint-staged").Configuration} */
export default {
  // Every staged file: block the commit if it contains something that looks like a secret.
  // It only reads files, so it can safely run at the same time as the tasks below.
  "*": "secretlint",
  // Code: fix lint problems, then format, then run the tests that import these files.
  // An array runs in order, so the two fixers never edit the same file at once.
  "*.{js,ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    // --passWithNoTests: a staged file that no test imports is fine.
    "vitest related --run --passWithNoTests",
  ],
  // Everything else Prettier understands (JSON, Markdown, YAML...).
  "!(*.{js,ts,tsx})": "prettier --write --ignore-unknown",
};
