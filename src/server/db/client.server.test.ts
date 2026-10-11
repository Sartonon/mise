import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sql } from 'drizzle-orm'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDb } from './client.server'

describe('createDb', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('runs a query against an isolated in-memory database', async () => {
    const db = createDb({ url: ':memory:' })
    try {
      expect(await db.get(sql`select 1 as connected`)).toEqual({ connected: 1 })
    } finally {
      db.$client.close()
    }
  })

  it('reads DATABASE_URL and persists data in a local file', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'mise-db-'))
    vi.stubEnv('DATABASE_URL', `file:${join(directory, 'test.db')}`)
    vi.stubEnv('DATABASE_AUTH_TOKEN', undefined)
    try {
      const first = createDb()
      try {
        await first.run(sql`create table connection_check (value text not null)`)
        await first.run(sql`insert into connection_check values ('saved')`)
      } finally {
        first.$client.close()
      }

      const second = createDb()
      try {
        expect(await second.get(sql`select value from connection_check`)).toEqual({
          value: 'saved',
        })
      } finally {
        second.$client.close()
      }
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
