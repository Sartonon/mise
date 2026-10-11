import '@tanstack/react-start/server-only'
import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { createClient } from '@libsql/client'
import type { Config } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

// Node loads local settings without replacing environment variables supplied by the host.
// Vercel has no .env file: its settings are already in process.env.
if (existsSync('.env')) loadEnvFile('.env')

// The caller owns this connection and closes db.$client when finished.
// Tests can pass { url: ':memory:' } instead of opening the development file.
export function createDb(
  config: Config = {
    url: process.env.DATABASE_URL ?? 'file:local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
) {
  return drizzle(createClient(config))
}
