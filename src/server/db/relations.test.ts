import { asc, eq, sql } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Db } from './client'
import { ingredients, recipes, recipeTags, steps, tags } from './schema'
import { createTestDb } from './test-db'

// A recipe with two ingredients, two steps and two tags, plus a second recipe sharing one tag.
// The lists are inserted out of order, to show that `position` sets the order, not insertion.
async function insertShakshuka(db: Db) {
  const shakshuka = await db.insert(recipes).values({ title: 'Shakshuka' }).returning().get()
  const toast = await db.insert(recipes).values({ title: 'Cheese toast' }).returning().get()
  await db.insert(ingredients).values([
    { recipeId: shakshuka.id, position: 1, quantity: 400, unit: 'g', name: 'tomatoes' },
    { recipeId: shakshuka.id, position: 0, quantity: 4, unit: null, name: 'eggs' },
  ])
  await db.insert(steps).values([
    { recipeId: shakshuka.id, position: 1, text: 'Crack in the eggs.' },
    { recipeId: shakshuka.id, position: 0, text: 'Simmer the tomatoes.' },
  ])
  const [vegetarian, quick] = await db
    .insert(tags)
    .values([{ name: 'vegetarian' }, { name: 'quick' }])
    .returning()
  if (!vegetarian || !quick) throw new Error('tags were not inserted')
  await db.insert(recipeTags).values([
    { recipeId: shakshuka.id, tagId: vegetarian.id },
    { recipeId: shakshuka.id, tagId: quick.id },
    { recipeId: toast.id, tagId: quick.id },
  ])
  return { shakshuka, toast, vegetarian, quick }
}

describe('related tables', () => {
  let db: Db
  beforeEach(async () => {
    db = await createTestDb()
  })
  afterEach(() => {
    db.$client.close()
  })

  it('loads a recipe with its ingredients, steps and tags in one query', async () => {
    const { shakshuka } = await insertShakshuka(db)

    // `with` follows the relations in schema.ts. Drizzle turns this into a single SQL query.
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, shakshuka.id),
      columns: { title: true },
      with: {
        ingredients: {
          columns: { quantity: true, unit: true, name: true },
          orderBy: [asc(ingredients.position)],
        },
        steps: { columns: { text: true }, orderBy: [asc(steps.position)] },
        // Through the join table: each recipe_tags row, and the tag it points to.
        recipeTags: { columns: {}, with: { tag: { columns: { name: true } } } },
      },
    })

    expect(recipe).toEqual({
      title: 'Shakshuka',
      ingredients: [
        { quantity: 4, unit: null, name: 'eggs' },
        { quantity: 400, unit: 'g', name: 'tomatoes' },
      ],
      steps: [{ text: 'Simmer the tomatoes.' }, { text: 'Crack in the eggs.' }],
      recipeTags: expect.arrayContaining([
        { tag: { name: 'vegetarian' } },
        { tag: { name: 'quick' } },
      ]) as unknown,
    })
    expect(recipe?.recipeTags).toHaveLength(2)
  })

  it('finds the recipes with a tag, from the other side of the join table', async () => {
    const { quick } = await insertShakshuka(db)

    const tag = await db.query.tags.findFirst({
      where: eq(tags.id, quick.id),
      with: { recipeTags: { with: { recipe: { columns: { title: true } } } } },
    })

    expect(tag?.recipeTags.map((link) => link.recipe.title).sort()).toEqual([
      'Cheese toast',
      'Shakshuka',
    ])
  })

  it('deletes the ingredients, steps and tag links with their recipe, but keeps the tags', async () => {
    const { shakshuka, toast } = await insertShakshuka(db)

    await db.delete(recipes).where(eq(recipes.id, shakshuka.id))

    expect(await db.$count(ingredients)).toBe(0)
    expect(await db.$count(steps)).toBe(0)
    // Only the other recipe's link is left.
    expect(await db.select().from(recipeTags)).toEqual([
      { recipeId: toast.id, tagId: expect.any(Number) as unknown },
    ])
    expect(await db.$count(tags)).toBe(2)
  })

  it('removes a deleted tag from every recipe, but keeps the recipes', async () => {
    const { quick } = await insertShakshuka(db)

    await db.delete(tags).where(eq(tags.id, quick.id))

    expect(await db.$count(recipeTags, eq(recipeTags.tagId, quick.id))).toBe(0)
    expect(await db.$count(recipeTags)).toBe(1)
    expect(await db.$count(recipes)).toBe(2)
  })

  it('refuses an ingredient for a recipe that does not exist', async () => {
    // This is the foreign key check. `cause.message` is SQLite's own message, as in schema.test.ts.
    await expect(
      db.insert(ingredients).values({ recipeId: 999, position: 0, name: 'eggs' }),
    ).rejects.toHaveProperty(
      'cause.message',
      expect.stringMatching(/FOREIGN KEY constraint failed/),
    )
  })

  it('refuses two ingredients at the same position, the same tag twice, and a duplicate tag name', async () => {
    const { shakshuka, quick } = await insertShakshuka(db)

    await expect(
      db.insert(ingredients).values({ recipeId: shakshuka.id, position: 0, name: 'salt' }),
    ).rejects.toHaveProperty('cause.message', expect.stringMatching(/UNIQUE constraint failed/))
    await expect(
      db.insert(recipeTags).values({ recipeId: shakshuka.id, tagId: quick.id }),
    ).rejects.toHaveProperty('cause.message', expect.stringMatching(/UNIQUE constraint failed/))
    await expect(db.insert(tags).values({ name: 'quick' })).rejects.toHaveProperty(
      'cause.message',
      expect.stringMatching(/UNIQUE constraint failed: tags\.name/),
    )
  })

  it('gets an index for every way the tables are looked up', async () => {
    // Without these, finding one recipe's ingredients (or cascading a delete) reads every row.
    // `sqlite_autoindex_*` are the indexes SQLite makes for primary keys and unique constraints.
    const indexes = await db.all<{ tbl_name: string; name: string }>(
      sql`select tbl_name, name from sqlite_master
          where type = 'index' and tbl_name in ('ingredients', 'steps', 'tags', 'recipe_tags')
          order by tbl_name, name`,
    )

    expect(indexes).toEqual([
      { tbl_name: 'ingredients', name: 'ingredients_recipe_id_position_unique' },
      { tbl_name: 'recipe_tags', name: 'recipe_tags_tag_id_idx' },
      { tbl_name: 'recipe_tags', name: 'sqlite_autoindex_recipe_tags_1' },
      { tbl_name: 'steps', name: 'steps_recipe_id_position_unique' },
      { tbl_name: 'tags', name: 'tags_name_unique' },
    ])
  })
})
