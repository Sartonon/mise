import { defineConfig } from 'drizzle-kit'
import { databaseConfigFromEnv } from './src/server/db/client'

// Settings for drizzle-kit, the command-line tool that creates and runs migrations.
// drizzle-kit loads `.env` by itself, so DATABASE_URL is set here without any extra package.
export default defineConfig({
  // `turso` is drizzle-kit's name for libSQL. It works with a local `file:` URL as well as
  // with Turso, and it's the only SQLite dialect that sends an auth token.
  dialect: 'turso',
  // The same function the app uses, so both always talk to the same database.
  dbCredentials: databaseConfigFromEnv(),
  // Step 24 adds `schema` (our tables in TypeScript) and `out` (where the SQL migrations go).
})
