import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { defineConfig } from 'drizzle-kit'

if (existsSync('.env')) loadEnvFile('.env')

// Drizzle Kit uses this to generate and apply migrations (starting in step 24).
export default defineConfig({
  dialect: 'turso',
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
})
