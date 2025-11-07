import { createSelectSchema } from 'drizzle-zod'
import { Elysia } from 'elysia'
import { z } from 'zod/v4'
import { journals } from '@/db/schema/journals'
import { getJournalUseCase } from '@/domain/use-cases/get-journal'
import { betterAuthPlugin } from '@/http/plugins/better-auth'
import { unwrapOrThrow } from '@/shared/result'

const getJournalSchema = z.object({
  journalId: z.string(),
})

const getJournalResponse = createSelectSchema(journals).extend({
  aiAnalysis: z.unknown().nullable().optional(),
})

export const getJournal = new Elysia().use(betterAuthPlugin).get(
  '/journal/:journalId',
  async ({ params, user, status }) => {
    const { journalId } = params

    const result = await getJournalUseCase({
      userId: user.id,
      journalId,
    })

    const journal = unwrapOrThrow(result)

    return status(200, journal)
  },
  {
    auth: true,
    detail: {
      tags: ['journal'],
      summary: 'Get a journal entry',
      description: 'Get a journal entry for the authenticated user',
      operationId: 'getJournal',
    },
    params: getJournalSchema,
    response: {
      200: getJournalResponse,
      404: z.object({ error: z.string(), message: z.string() }),
    },
  },
)
