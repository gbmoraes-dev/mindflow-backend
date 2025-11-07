import { createSelectSchema } from 'drizzle-zod'
import { Elysia } from 'elysia'
import { z } from 'zod/v4'
import { journals } from '@/db/schema/journals'
import { createJournalUseCase } from '@/domain/use-cases/create-journal'
import { betterAuthPlugin } from '@/http/plugins/better-auth'
import { unwrapOrThrow } from '@/shared/result'

const createJournalSchema = z.object({
  content: z.string().min(1).max(1000),
})

const createJournalResponse = createSelectSchema(journals).extend({
  aiAnalysis: z.unknown().nullable().optional(),
})

export const createJournal = new Elysia().use(betterAuthPlugin).post(
  '/journal',
  async ({ body, user, status }) => {
    const { content } = body

    const result = await createJournalUseCase({
      userId: user.id,
      content,
    })

    const journal = unwrapOrThrow(result)

    return status(201, journal)
  },
  {
    auth: true,
    detail: {
      tags: ['journal'],
      summary: 'Create a new journal entry',
      description: 'Create a new journal entry for the authenticated user',
      operationId: 'createJournal',
    },
    body: createJournalSchema,
    response: {
      201: createJournalResponse,
      400: z.object({ error: z.string(), message: z.string() }),
    },
  },
)
