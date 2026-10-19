import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

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

// The types of a row, worked out from the columns above.
// `Recipe` is what a query returns; `NewRecipe` is what an insert takes, where the columns with
// a default (id, servings, createdAt) and the nullable ones are optional.
export type Recipe = typeof recipes.$inferSelect
export type NewRecipe = typeof recipes.$inferInsert
