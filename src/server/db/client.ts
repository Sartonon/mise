import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

// Server-only: it reads secrets from env vars. Only server code may import it.

// Where the database is. One URL describes any libSQL database:
// - `file:local.db`                 a SQLite file on this machine (development)
// - `:memory:`                      a database that lives only as long as the process (tests)
// - `libsql://<name>.turso.io`      a hosted Turso database (production, step 27), which also
//                                   needs an auth token
// The code is the same for all three; only the URL changes. That's why it comes from an env
// var: each place the app runs (your machine, CI, Vercel) sets its own.
export type DatabaseConfig = {
  url: string
  authToken: string | undefined
}

// Takes the env as a parameter (instead of reading `process.env` inside), so a test can pass
// in any env it likes without changing the real one.
export function databaseConfigFromEnv(
  env: Record<string, string | undefined> = process.env,
): DatabaseConfig {
  const url = env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set. For local development, copy .env.example to .env.')
  }
  // `||` and not `??`: an empty value (`DATABASE_AUTH_TOKEN=`) means no token too.
  return { url, authToken: env.DATABASE_AUTH_TOKEN || undefined }
}

// Drizzle on top of libSQL's client. `drizzle()` opens the connection lazily, on the first query.
// Passing the schema (tables and relations) turns on the query API: `db.query.recipes.findMany()`.
// libSQL checks foreign keys (and runs `onDelete: 'cascade'`) by default. Plain SQLite doesn't,
// unless each connection runs `PRAGMA foreign_keys = ON`.
export function createDb(config: DatabaseConfig) {
  return drizzle({ connection: config, schema })
}

// The type of a database handle. Plain functions will take a `db: Db` parameter, so the app
// passes the real database and tests pass an in-memory one.
export type Db = ReturnType<typeof createDb>
