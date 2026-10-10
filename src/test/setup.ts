// Runs before every component test file (see `setupFiles` in vitest.config.ts).
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Adds DOM matchers to `expect`, like `toBeInTheDocument()` and `toHaveTextContent()`.
import "@testing-library/jest-dom/vitest";

// Remove what each test rendered, so the next test starts with an empty page.
// (Testing Library only does this by itself when Vitest's `globals` option is on.)
afterEach(() => {
  cleanup();
});
