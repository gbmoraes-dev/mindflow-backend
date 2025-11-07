import { randomUUIDv7 } from 'bun'
import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const analysisStatusEnum = pgEnum('analysis_status', [
  'pending',
  'processing',
  'completed',
  'failed',
])

export const journals = pgTable('journals', {
  id: uuid()
    .$defaultFn(() => randomUUIDv7())
    .primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text().notNull(),
  analysisStatus: analysisStatusEnum().default('pending').notNull(),
  aiAnalysis: jsonb(),
  createdAt: timestamp()
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp()
    .$defaultFn(() => new Date())
    .notNull(),
})
