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
  const startDate = dayjs().subtract(periodDays, 'day').startOf('day').toDate()
  const dateColumn =
    sql<string>`DATE_TRUNC('day', ${schema.journals.createdAt})`.as('date')
  const positiveCount =
    sql<number>`COUNT(*) FILTER (WHERE ai_analysis->>'sentiment' = 'positivo')`.as(
      'positive',
    )
  const negativeCount =
    sql<number>`COUNT(*) FILTER (WHERE ai_analysis->>'sentiment' = 'negativo')`.as(
      'negative',
    )
  const neutralCount =
    sql<number>`COUNT(*) FILTER (WHERE ai_analysis->>'sentiment' = 'neutro')`.as(
      'neutral',
    )

  const sentimentHistoryQuery = db
    .select({
      date: dateColumn,
      positive: positiveCount,
      negative: negativeCount,
      neutral: neutralCount,
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
    .groupBy(dateColumn)
    .orderBy(dateColumn)

  const topicsArray = sql`jsonb_array_elements_text(ai_analysis->'topics') AS topic`
  const topicColumn = sql<string>`topic`.as('topic')

  const recurringTopicsQuery = db
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
    .limit(5)

  const [dbSentimentHistory, recurringTopics] = await Promise.all([
    sentimentHistoryQuery,
    recurringTopicsQuery,
  ])

  const dateMap = new Map<
    string,
    { date: string; positive: number; negative: number; neutral: number }
  >()

  for (let i = 0; i < periodDays; i++) {
    const date = dayjs().subtract(i, 'day').startOf('day')
    const dateString = date.toISOString()

    dateMap.set(dateString, {
      date: dateString,
      positive: 0,
      negative: 0,
      neutral: 0,
    })
  }

  for (const dayData of dbSentimentHistory) {
    const dateString = dayjs(dayData.date).toISOString()
    if (dateMap.has(dateString)) {
      dateMap.set(dateString, {
        date: dateString,
        positive: Number(dayData.positive),
        negative: Number(dayData.negative),
        neutral: Number(dayData.neutral),
      })
    }
  }

  const sentimentHistory = Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  return ok({
    sentimentHistory,
    recurringTopics,
  })
}
