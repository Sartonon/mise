import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    // Same as in vitest.config.ts: read the `~/*` alias from tsconfig.json.
    tsconfigPaths: true,
  },
  plugins: [
    // TanStack Start: file-based routing, server rendering and server functions.
    // It must come before the React plugin, because it rewrites our code first.
    tanstackStart(),
    // Nitro: wraps Start's server bundle into a server for a specific host.
    // It detects the host from environment variables: on Vercel (`VERCEL` is set)
    // it writes `.vercel/output`. When it finds no known host, as on our machines
    // and in CI, it writes a plain Node.js server to `.output/`.
    nitro(),
    // React: compiles JSX, and updates components in the browser without a full reload.
    viteReact(),
  ],
})
