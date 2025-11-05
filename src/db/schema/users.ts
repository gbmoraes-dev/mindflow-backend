import { randomUUIDv7 } from 'bun'
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid()
    .$defaultFn(() => randomUUIDv7())
    .primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  image: text(),
  createdAt: timestamp()
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
