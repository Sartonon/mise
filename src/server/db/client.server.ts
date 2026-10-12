// `.server.ts`: the database client never belongs in the browser (it would need the token).
import { drizzle } from 'drizzle-orm/libsql'

// A plain function: give it a URL, get a Drizzle database. The same code talks to
// - a local file:          `file:local.db`
// - memory (for tests):    `:memory:`
// - Turso, over the network: `libsql://<name>.turso.io`, which also needs the auth token.
export function createDb(url: string, authToken?: string) {
  return drizzle({ connection: { url, authToken } })
}

// The type of a database made by `createDb`, so functions can take one as a parameter
// (`listRecipes(db: Db)`) and tests can pass an in-memory one.
export type Db = ReturnType<typeof createDb>

let db: Db | undefined

// The app's own database, from env vars. Created on first use rather than when this file
// is imported, so importing it never fails just because `DATABASE_URL` isn't set (in tests).
export function getDb(): Db {
  if (!db) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error('DATABASE_URL is not set. Copy .env.example to .env to use a local database.')
    }
    db = createDb(url, process.env.DATABASE_AUTH_TOKEN)
  }
  return db
}
