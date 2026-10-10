import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Read the `~/*` alias from tsconfig.json, so it is defined in one place only.
    tsconfigPaths: true,
  },
  test: {
    // Two groups of tests, each with its own environment.
    // `extends: true` makes each one inherit the settings above (the alias).
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          // Plain logic: runs in Node, with no DOM.
          include: ["src/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "component",
          // React components: jsdom gives them a fake `document` and `window`.
          include: ["src/**/*.test.tsx"],
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
        },
      },
    ],
  },
});
