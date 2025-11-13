import { createSelectSchema } from 'drizzle-zod'
import { Elysia } from 'elysia'
import { z } from 'zod/v4'
import { journals } from '@/db/schema/journals'
import { listJournalsUseCase } from '@/domain/use-cases/list-journals'
import { betterAuthPlugin } from '@/http/plugins/better-auth'
import { unwrapOrThrow } from '@/shared/result'
import { serializeJournals } from '@/shared/serializer'

const listJournalsQuery = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
})

const journalItemSchema = createSelectSchema(journals, {
  createdAt: z.coerce.string(),
})
  .pick({
    id: true,
    createdAt: true,
  })
  .extend({
    sentiment: z.string(),
  })

const listJournalsResponse = z.object({
  journals: z.array(journalItemSchema),
  nextCursor: z.string().nullable(),
})

export const listJournals = new Elysia().use(betterAuthPlugin).get(
  '/journal',
  async ({ user, query, status }) => {
    const { limit, cursor } = query

    const result = await listJournalsUseCase({
      userId: user.id,
      cursor,
      limit,
    })

    const data = unwrapOrThrow(result)

    return status(200, {
      journals: serializeJournals(data.journals),
      nextCursor: data.nextCursor,
    })
  },
  {
    auth: true,
    detail: {
      tags: ['journal'],
      summary: 'List a journals (paginated)',
      description:
        'List all journal entries for the authenticated user using cursor pagination.',
      operationId: 'listJournals',
    },
    query: listJournalsQuery,
    response: {
      200: listJournalsResponse,
    },
  },
)
