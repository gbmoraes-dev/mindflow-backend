import dayjs from 'dayjs'
import { and, count, desc, eq, gte, isNotNull, sql } from 'drizzle-orm'
import { ok } from 'neverthrow'
import { db } from '@/db'
import { schema } from '@/db/schema'

export interface GetJournalsSummaryInput {
  userId: string
  periodDays: number
}

export const getJournalsSummaryUseCase = async ({
  userId,
  periodDays,
}: GetJournalsSummaryInput) => {
  const startDate = dayjs().subtract(periodDays, 'day').toDate()

  const sentimentColumn = sql<string>`ai_analysis->>'sentiment'`.as('sentiment')
  const topicsArray = sql`jsonb_array_elements_text(ai_analysis->'topics') AS topic`
  const topicColumn = sql<string>`topic`.as('topic')

  const [sentimentTrend, recurringTopics] = await Promise.all([
    db
      .select({
        sentiment: sentimentColumn,
        count: count(),
      })
      .from(schema.journals)
      .where(
        and(
          eq(schema.journals.userId, userId),
          gte(schema.journals.createdAt, startDate),
          eq(schema.journals.analysisStatus, 'completed'),
          isNotNull(sql`ai_analysis->>'sentiment'`),
        ),
      )
      .groupBy(sentimentColumn),

    db
      .select({
        topic: topicColumn,
        count: count(),
      })
      .from(schema.journals)
      .crossJoin(topicsArray)
      .where(
        and(
          eq(schema.journals.userId, userId),
          gte(schema.journals.createdAt, startDate),
          eq(schema.journals.analysisStatus, 'completed'),
        ),
      )
      .groupBy(topicColumn)
      .orderBy(desc(count()))
      .limit(5),
  ])

  return ok({
    sentimentTrend,
    recurringTopics,
  })
}
