import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Read the `~/*` alias from tsconfig.json, so it is defined in one place only.
    tsconfigPaths: true,
  },
  test: {
    // Only look for tests in our own code.
    include: ["src/**/*.test.ts"],
  },
});
