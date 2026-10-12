import { defineConfig } from 'drizzle-kit'

// drizzle-kit is the command-line tool that turns our schema into SQL migrations (step 24)
// and runs them. It loads `.env` by itself before reading this file.
export default defineConfig({
  // `turso` is libSQL: it works with a local file as well as a Turso database.
  dialect: 'turso',
  // Where the tables are described in TypeScript (written in step 24).
  schema: './src/server/db/schema.ts',
  // Where the generated SQL migrations go. They're committed, so every database runs the same ones.
  out: './drizzle',
  // No `throw` when DATABASE_URL is missing: other tools (Knip) read this file without a `.env`,
  // and drizzle-kit itself stops with "Please provide required params" on an empty URL.
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
})
