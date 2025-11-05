import { randomUUIDv7 } from 'bun'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const verifications = pgTable('verifications', {
  id: uuid()
    .$defaultFn(() => randomUUIDv7())
    .primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp()
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
