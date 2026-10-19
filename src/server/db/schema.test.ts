import { eq, sql } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Db } from './client'
import { recipes } from './schema'
import { createTestDb } from './test-db'

describe('recipes table', () => {
  let db: Db
  beforeEach(async () => {
    db = await createTestDb()
  })
  afterEach(() => {
    db.$client.close()
  })

  it('is created by the migrations, and starts empty', async () => {
    expect(await db.select().from(recipes)).toEqual([])
  })

  it('reads back an inserted recipe, with the defaults filled in', async () => {
    const before = new Date()
    // `.returning()` gives back the row as the database stored it, id and defaults included.
    // `.get()` returns that one row instead of a list of rows.
    const inserted = await db.insert(recipes).values({ title: 'Shakshuka' }).returning().get()

    const read = await db.select().from(recipes).where(eq(recipes.id, inserted.id)).get()

    expect(read).toEqual(inserted)
    expect(read).toMatchObject({
      id: 1,
      title: 'Shakshuka',
      description: null,
      servings: 4,
      minutes: null,
    })
    // Stored in whole seconds, so it can be up to a second before `before`.
    expect(read?.createdAt).toBeInstanceOf(Date)
    expect(read?.createdAt.getTime()).toBeGreaterThan(before.getTime() - 1000)
  })

  it('stores every field it is given', async () => {
    const createdAt = new Date('2026-01-02T03:04:05Z')
    await db.insert(recipes).values({
      title: 'Lentil soup',
      description: 'Red lentils, cumin and lemon.',
      servings: 6,
      minutes: 40,
      createdAt,
    })

    expect(await db.select().from(recipes)).toEqual([
      {
        id: 1,
        title: 'Lentil soup',
        description: 'Red lentils, cumin and lemon.',
        servings: 6,
        minutes: 40,
        createdAt,
      },
    ])
  })

  it('never reuses the id of a deleted recipe', async () => {
    const first = await db.insert(recipes).values({ title: 'First' }).returning().get()
    await db.delete(recipes).where(eq(recipes.id, first.id))

    const second = await db.insert(recipes).values({ title: 'Second' }).returning().get()

    expect(second.id).toBe(first.id + 1)
  })

  it('refuses a recipe without a title', async () => {
    // TypeScript already rejects this insert, so it's written in raw SQL to reach the
    // database's own `NOT NULL` check. Drizzle wraps the error ("Failed query: ..."), and
    // SQLite's message is in its `cause`.
    await expect(db.run(sql`insert into recipes (servings) values (2)`)).rejects.toHaveProperty(
      'cause.message',
      expect.stringMatching(/NOT NULL constraint failed: recipes\.title/),
    )
  })

  it('gives every test its own empty database', async () => {
    // The tests above inserted rows; none of them are here.
    expect(await db.$count(recipes)).toBe(0)
  })
})
