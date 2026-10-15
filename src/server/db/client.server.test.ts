import { mkdtempSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sql } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest'
import { createDb } from './client.server'

describe('createDb', () => {
  it('runs SQL on an in-memory database', async () => {
    const db = createDb(':memory:')
    // `onTestFinished` runs even when the test fails, so the client is always closed.
    onTestFinished(() => {
      db.$client.close()
    })

    // `sql` is Drizzle's escape hatch for raw SQL. From step 24, queries are built from the schema.
    const row = await db.get<{ answer: number }>(sql`select 6 * 7 as answer`)

    expect(row.answer).toBe(42)
  })

  it('creates the file for a `file:` URL', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mise-db-'))
    const path = join(dir, 'test.db')
    const db = createDb(`file:${path}`)
    // Close the client before removing its directory: the file is still open until then.
    onTestFinished(() => {
      db.$client.close()
      rmSync(dir, { recursive: true, force: true })
    })

    await db.run(sql`create table t (id integer)`)

    expect(existsSync(path)).toBe(true)
  })
})

describe('getDb', () => {
  // `getDb` keeps its database in a module-level variable. Re-importing the module after
  // `vi.resetModules()` gives each test a fresh, empty one, so test order can't matter.
  async function importGetDb() {
    const { getDb } = await import('./client.server')
    return getDb
  }

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('explains what to do when DATABASE_URL is missing', async () => {
    vi.stubEnv('DATABASE_URL', undefined)
    const getDb = await importGetDb()

    expect(() => getDb()).toThrow(/Copy \.env\.example to \.env/)
  })

  it('connects to DATABASE_URL and reuses the same database', async () => {
    vi.stubEnv('DATABASE_URL', ':memory:')
    const getDb = await importGetDb()

    const db = getDb()
    onTestFinished(() => {
      db.$client.close()
    })
    const row = await db.get<{ answer: number }>(sql`select 6 * 7 as answer`)

    expect(row.answer).toBe(42)
    expect(getDb()).toBe(db)
  })

  it('passes DATABASE_URL and DATABASE_AUTH_TOKEN to the driver', async () => {
    // A fake `drizzle` that only records what it was called with, so no real connection opens.
    const drizzle = vi.fn(() => ({}))
    vi.doMock('drizzle-orm/libsql', () => ({ drizzle }))
    onTestFinished(() => {
      vi.doUnmock('drizzle-orm/libsql')
    })
    vi.stubEnv('DATABASE_URL', 'libsql://mise.example.turso.io')
    vi.stubEnv('DATABASE_AUTH_TOKEN', 'not-a-real-token')
    const getDb = await importGetDb()

    getDb()

    expect(drizzle).toHaveBeenCalledWith({
      connection: { url: 'libsql://mise.example.turso.io', authToken: 'not-a-real-token' },
    })
  })
})
