import { randomUUIDv7 } from 'bun'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'

export const accounts = pgTable('accounts', {
  id: uuid()
    .$defaultFn(() => randomUUIDv7())
    .primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text().notNull(),
  providerId: text().notNull(),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  password: text(),
  createdAt: timestamp()
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp()
    .$onUpdate(() => new Date())
    .notNull(),
})
