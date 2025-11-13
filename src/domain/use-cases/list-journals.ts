import { and, desc, eq, lt, sql } from 'drizzle-orm'
import { ok } from 'neverthrow'
import { db } from '@/db'
import { schema } from '@/db/schema'

export interface ListJournalsInput {
  userId: string
  cursor?: string
  limit: number
}

export const listJournalsUseCase = async ({
  userId,
  cursor,
  limit,
}: ListJournalsInput) => {
  const sentiment = sql<string>`ai_analysis->>'sentiment'`.as('sentiment')

  const journals = await db
    .select({
      id: schema.journals.id,
      createdAt: schema.journals.createdAt,
      sentiment,
    })
    .from(schema.journals)
    .where(
      and(
        eq(schema.journals.userId, userId),
        eq(schema.journals.analysisStatus, 'completed'),
        cursor ? lt(schema.journals.id, cursor) : undefined,
      ),
    )
    .orderBy(desc(schema.journals.id))
    .limit(limit + 1)

  const hasMore = journals.length > limit
  const items = hasMore ? journals.slice(0, limit) : journals
  const lastItem = items.at(-1)
  const nextCursor = hasMore && lastItem ? lastItem.id : null

  return ok({
    journals: items,
    nextCursor,
  })
}
