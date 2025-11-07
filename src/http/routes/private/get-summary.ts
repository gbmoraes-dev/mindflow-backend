import { Elysia } from 'elysia'
import { z } from 'zod/v4'
import { getJournalsSummaryUseCase } from '@/domain/use-cases/get-summary'
import { betterAuthPlugin } from '@/http/plugins/better-auth'
import { unwrapOrThrow } from '@/shared/result'

const getSummarySchema = z.object({
  period: z.enum(['7d', '30d']).default('7d'),
})

const sentimentTrendSchema = z.object({
  sentiment: z.string(),
  count: z.number().or(z.string().pipe(z.coerce.number())),
})

const recurringTopicSchema = z.object({
  topic: z.string(),
  count: z.number().or(z.string().pipe(z.coerce.number())),
})

const summaryResponseSchema = z.object({
  sentimentTrend: z.array(sentimentTrendSchema),
  recurringTopics: z.array(recurringTopicSchema),
})

export const getSummary = new Elysia().use(betterAuthPlugin).get(
  '/insights/summary',
  async ({ query, user, status }) => {
    const { period } = query

    const periodDays = period === '7d' ? 7 : 30

    const result = await getJournalsSummaryUseCase({
      userId: user.id,
      periodDays: periodDays,
    })

    const summary = unwrapOrThrow(result)

    return status(200, summary)
  },
  {
    auth: true,
    query: getSummarySchema,
    response: {
      200: summaryResponseSchema,
    },
    detail: {
      tags: ['insights'],
      summary: 'Get user journal summary',
      description:
        'Retrieves aggregated insights (sentiments and topics) for the user.',
      operationId: 'getSummary',
    },
  },
)
