import { eq } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Db } from './client'
import { ingredients, recipes, recipeTags, steps, tags } from './schema'
import { createTestDb } from './test-db'

let db: Db
beforeEach(async () => {
  db = await createTestDb()
})
afterEach(() => {
  db.$client.close()
})

// A recipe with two ingredients, two steps and two tags, plus a tag no recipe uses.
// Inserted out of order on purpose, so the tests show that `position` sets the order.
async function insertShakshuka() {
  const recipe = await db.insert(recipes).values({ title: 'Shakshuka' }).returning().get()
  await db.insert(ingredients).values([
    { recipeId: recipe.id, position: 1, quantity: 400, unit: 'g', name: 'chopped tomatoes' },
    { recipeId: recipe.id, position: 0, quantity: 4, unit: null, name: 'eggs' },
  ])
  await db.insert(steps).values([
    { recipeId: recipe.id, position: 1, text: 'Crack in the eggs and cover.' },
    { recipeId: recipe.id, position: 0, text: 'Simmer the tomatoes.' },
  ])
  const vegetarian = await db.insert(tags).values({ name: 'vegetarian' }).returning().get()
  const quick = await db.insert(tags).values({ name: 'quick' }).returning().get()
  await db.insert(tags).values({ name: 'baking' })
  await db.insert(recipeTags).values([
    { recipeId: recipe.id, tagId: vegetarian.id },
    { recipeId: recipe.id, tagId: quick.id },
  ])
  return { id: recipe.id, quickTagId: quick.id }
}

describe('the relational query API', () => {
  it('loads a recipe with its ingredients, steps and tags in one call', async () => {
    const { id } = await insertShakshuka()

    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, id),
      columns: { title: true },
      with: {
        ingredients: {
          columns: { quantity: true, unit: true, name: true },
          orderBy: ingredients.position,
        },
        steps: { columns: { text: true }, orderBy: steps.position },
        // Through the join table: each recipe_tags row, and the tag it points at.
        recipeTags: {
          columns: {},
          with: { tag: { columns: { name: true } } },
          orderBy: recipeTags.tagId,
        },
      },
    })

    expect(recipe).toEqual({
      title: 'Shakshuka',
      ingredients: [
        { quantity: 4, unit: null, name: 'eggs' },
        { quantity: 400, unit: 'g', name: 'chopped tomatoes' },
      ],
      steps: [{ text: 'Simmer the tomatoes.' }, { text: 'Crack in the eggs and cover.' }],
      recipeTags: [{ tag: { name: 'vegetarian' } }, { tag: { name: 'quick' } }],
    })
  })

  it('finds no recipe for an unknown id', async () => {
    expect(await db.query.recipes.findFirst({ where: eq(recipes.id, 999) })).toBeUndefined()
  })
})

describe('foreign keys', () => {
  it('deleting a recipe deletes its ingredients, steps and tag links, but not the tags', async () => {
    const { id } = await insertShakshuka()

    await db.delete(recipes).where(eq(recipes.id, id))

    expect(await db.$count(ingredients)).toBe(0)
    expect(await db.$count(steps)).toBe(0)
    expect(await db.$count(recipeTags)).toBe(0)
    expect(await db.$count(tags)).toBe(3)
  })

  it('deleting a tag removes it from its recipes, but keeps the recipes', async () => {
    const { id } = await insertShakshuka()

    await db.delete(tags).where(eq(tags.name, 'quick'))

    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, id),
      with: { recipeTags: { with: { tag: true } } },
    })
    expect(recipe?.recipeTags.map((link) => link.tag.name)).toEqual(['vegetarian'])
  })

  it('refuses an ingredient for a recipe that does not exist', async () => {
    const insert = db.insert(ingredients).values({ recipeId: 999, position: 0, name: 'salt' })

    await expect(insert).rejects.toHaveProperty(
      'cause.message',
      expect.stringMatching(/FOREIGN KEY constraint failed/),
    )
  })
})

describe('constraints', () => {
  it('refuses two ingredients in the same place of one recipe', async () => {
    const { id } = await insertShakshuka()

    await expect(
      db.insert(ingredients).values({ recipeId: id, position: 0, name: 'salt' }),
    ).rejects.toHaveProperty(
      'cause.message',
      expect.stringMatching(
        /UNIQUE constraint failed: ingredients\.recipe_id, ingredients\.position/,
      ),
    )
  })

  it('refuses the same tag twice on one recipe, and two tags with the same name', async () => {
    const { id, quickTagId } = await insertShakshuka()

    await expect(
      db.insert(recipeTags).values({ recipeId: id, tagId: quickTagId }),
    ).rejects.toHaveProperty('cause.message', expect.stringMatching(/UNIQUE constraint failed/))
    await expect(db.insert(tags).values({ name: 'quick' })).rejects.toHaveProperty(
      'cause.message',
      expect.stringMatching(/UNIQUE constraint failed: tags\.name/),
    )
  })
})
