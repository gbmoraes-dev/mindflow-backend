import { randomUUIDv7 } from 'bun'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'

export const sessions = pgTable('sessions', {
  id: uuid()
    .$defaultFn(() => randomUUIDv7())
    .primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp()
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp()
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text(),
  userAgent: text(),
})
