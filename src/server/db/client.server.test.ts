import { mkdtempSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sql } from 'drizzle-orm'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDb, getDb } from './client.server'

describe('createDb', () => {
  it('runs SQL on an in-memory database', async () => {
    const db = createDb(':memory:')

    // `sql` is Drizzle's escape hatch for raw SQL. From step 24, queries are built from the schema.
    const row = await db.get<{ answer: number }>(sql`select 6 * 7 as answer`)

    expect(row.answer).toBe(42)
  })

  it('creates the file for a `file:` URL', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mise-db-'))
    const path = join(dir, 'test.db')
    const db = createDb(`file:${path}`)

    await db.run(sql`create table t (id integer)`)

    expect(existsSync(path)).toBe(true)
    db.$client.close()
    rmSync(dir, { recursive: true })
  })
})

describe('getDb', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('explains what to do when DATABASE_URL is missing', () => {
    vi.stubEnv('DATABASE_URL', undefined)

    expect(() => getDb()).toThrow(/Copy \.env\.example to \.env/)
  })
})
