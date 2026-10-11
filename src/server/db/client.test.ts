import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sql } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import { createDb, databaseConfigFromEnv, type Db } from './client'

describe('databaseConfigFromEnv', () => {
  it('reads the URL, with no auth token for a local file', () => {
    expect(databaseConfigFromEnv({ DATABASE_URL: 'file:local.db' })).toEqual({
      url: 'file:local.db',
      authToken: undefined,
    })
  })

  it('reads the auth token for a remote database', () => {
    const config = databaseConfigFromEnv({
      DATABASE_URL: 'libsql://mise.example.turso.io',
      DATABASE_AUTH_TOKEN: 'not-a-real-token',
    })

    expect(config).toEqual({ url: 'libsql://mise.example.turso.io', authToken: 'not-a-real-token' })
  })

  it('treats an empty auth token as none, as .env.example leaves it', () => {
    expect(
      databaseConfigFromEnv({ DATABASE_URL: 'file:local.db', DATABASE_AUTH_TOKEN: '' }).authToken,
    ).toBeUndefined()
  })

  it('fails with a helpful message when DATABASE_URL is missing or empty', () => {
    expect(() => databaseConfigFromEnv({})).toThrow(/DATABASE_URL is not set/)
    expect(() => databaseConfigFromEnv({ DATABASE_URL: '' })).toThrow(/DATABASE_URL is not set/)
  })
})

describe('createDb', () => {
  // The kind of plain function later steps write: it takes any `Db`, and doesn't care where it is.
  async function addTwoNumbers(db: Db) {
    return db.get<{ sum: number }>(sql`select 1 + 1 as sum`)
  }

  const tempDirs: string[] = []
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true })
  })

  it('runs a query against an in-memory database', async () => {
    const db = createDb({ url: ':memory:', authToken: undefined })

    expect(await addTwoNumbers(db)).toEqual({ sum: 2 })
    db.$client.close()
  })

  it('runs the same query against a database file, creating the file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mise-db-'))
    tempDirs.push(dir)
    const file = join(dir, 'test.db')
    const db = createDb({ url: `file:${file}`, authToken: undefined })

    expect(await addTwoNumbers(db)).toEqual({ sum: 2 })
    expect(existsSync(file)).toBe(true)
    db.$client.close()
  })
})
