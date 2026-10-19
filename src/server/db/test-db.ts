import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { createDb } from './client'

// The migrations folder, found from this file rather than from the current directory,
// so it works wherever the tests are started from.
const migrationsFolder = fileURLToPath(new URL('../../../drizzle', import.meta.url))

// A fresh, empty database for one test: in memory, with every migration applied, exactly as
// `pnpm db:migrate` would set up a real one. Nothing is shared between tests, and nothing is
// left on disk. Close it when the test is done: `db.$client.close()`.
export async function createTestDb() {
  const db = createDb({ url: ':memory:', authToken: undefined })
  await migrate(db, { migrationsFolder })
  return db
}
