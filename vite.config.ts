import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    // Same as in vitest.config.ts: read the `~/*` alias from tsconfig.json.
    tsconfigPaths: true,
  },
  plugins: [
    // TanStack Start: file-based routing, server rendering and server functions.
    // It must come before the React plugin, because it rewrites our code first.
    tanstackStart(),
    // Nitro: builds the server for the host. On Vercel it detects Vercel and writes the Vercel output.
    nitro(),
    // React: compiles JSX, and updates components in the browser without a full reload.
    viteReact(),
  ],
});
