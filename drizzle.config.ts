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
  // Our tables in TypeScript. drizzle-kit compares them with the last migration's snapshot
  // and writes a new migration for the difference.
  schema: './src/server/db/schema.ts',
  // Where the migrations go: one numbered `.sql` file per migration, plus `meta/` with a snapshot
  // of the schema after each one and `_journal.json`, the list of them in order. All of it is
  // committed, and a migration is never edited by hand once it has been applied anywhere.
  out: './drizzle',
})
