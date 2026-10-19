import { relations, sql } from 'drizzle-orm'
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

// Our tables, written in TypeScript. This file is the source of truth:
// - drizzle-kit reads it to write the SQL migrations in `drizzle/` (`pnpm db:generate`)
// - our code imports it to query the tables, with types worked out from the columns
// The first argument of each column is its name in the database (snake_case, as SQL likes it);
// the object key is its name in TypeScript (camelCase).
export const recipes = sqliteTable('recipes', {
  // `autoIncrement` never reuses the id of a deleted recipe, so an old link (`/recipes/7`)
  // can never open a different recipe. Without it, SQLite may hand out the highest id again.
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  // No `.notNull()`: a recipe may have no description, so its type is `string | null`.
  description: text('description'),
  // How many people the amounts are for. The servings scaler (step 33) starts from it.
  servings: integer('servings').notNull().default(4),
  // Total time in minutes, if known.
  minutes: integer('minutes'),
  // SQLite has no date type. `mode: 'timestamp'` stores seconds since 1970 as an integer, and
  // Drizzle turns it into a JavaScript `Date` both ways. The default is written by SQLite
  // itself (`unixepoch()` is the time now), so rows inserted by any tool get it too.
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

// One line of a recipe's ingredient list: "200 g red lentils", "2 cloves garlic", "salt".
export const ingredients = sqliteTable(
  'ingredients',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    // A foreign key: every ingredient belongs to one recipe, and the database refuses an id that
    // isn't in `recipes`. `onDelete: 'cascade'`: deleting a recipe deletes its ingredients too.
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    // Where it is in the list (0, 1, 2...). Rows in SQL have no order of their own.
    position: integer('position').notNull(),
    // `real` is a floating-point number, so 0.5 (cups) works. Empty for "salt, to taste".
    quantity: real('quantity'),
    unit: text('unit'),
    name: text('name').notNull(),
  },
  // Table-level settings, after the columns. A unique index on (recipe, position): no two
  // ingredients of one recipe share a place in the list. The index also makes "all the
  // ingredients of recipe 7" fast, since it's sorted by `recipe_id` first.
  (table) => [uniqueIndex('ingredients_recipe_position').on(table.recipeId, table.position)],
)

// One step of a recipe's method, in order.
export const steps = sqliteTable(
  'steps',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    text: text('text').notNull(),
  },
  (table) => [uniqueIndex('steps_recipe_position').on(table.recipeId, table.position)],
)

// A label like "vegetarian" or "quick", shared by many recipes.
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
})

// A join table: a recipe has many tags and a tag has many recipes ("many-to-many"), which
// one foreign key can't express. Each row links one recipe to one tag.
export const recipeTags = sqliteTable(
  'recipe_tags',
  {
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    // The two columns together are the primary key, so a recipe can't have the same tag twice.
    // Its index is sorted by `recipe_id` first, so "the tags of recipe 7" is fast...
    primaryKey({ columns: [table.recipeId, table.tagId] }),
    // ...and this one makes the other direction fast: "the recipes tagged 'quick'".
    index('recipe_tags_tag_id').on(table.tagId),
  ],
)

// Relations tell Drizzle's query API (`db.query.recipes.findMany({ with: ... })`) how the
// tables connect, so it can load a recipe with its ingredients in one call. They don't change
// the database at all (the foreign keys above do that); drizzle-kit ignores them.
// `many` is the "one recipe has many ingredients" side; `one` is the side with the foreign key.
export const recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(ingredients),
  steps: many(steps),
  recipeTags: many(recipeTags),
}))

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
  recipe: one(recipes, { fields: [ingredients.recipeId], references: [recipes.id] }),
}))

export const stepsRelations = relations(steps, ({ one }) => ({
  recipe: one(recipes, { fields: [steps.recipeId], references: [recipes.id] }),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  recipeTags: many(recipeTags),
}))

export const recipeTagsRelations = relations(recipeTags, ({ one }) => ({
  recipe: one(recipes, { fields: [recipeTags.recipeId], references: [recipes.id] }),
  tag: one(tags, { fields: [recipeTags.tagId], references: [tags.id] }),
}))

// The types of a row, worked out from the columns above.
// `Recipe` is what a query returns; `NewRecipe` is what an insert takes, where the columns with
// a default (id, servings, createdAt) and the nullable ones are optional.
export type Recipe = typeof recipes.$inferSelect
export type NewRecipe = typeof recipes.$inferInsert
