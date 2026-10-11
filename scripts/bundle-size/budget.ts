import type { Budget } from './report.ts'

// The most the app may send to the browser, compressed. `pnpm size` fails above these,
// and so does CI. Raise them on purpose (in a pull request that says why), never by accident.
export const budget: Budget = {
  js: 200_000,
  css: 10_000,
}
