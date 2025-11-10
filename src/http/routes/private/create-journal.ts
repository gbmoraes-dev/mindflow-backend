import { createSelectSchema } from 'drizzle-zod'
import { Elysia } from 'elysia'
import { z } from 'zod/v4'
import { journals } from '@/db/schema/journals'
import { createJournalUseCase } from '@/domain/use-cases/create-journal'
import { betterAuthPlugin } from '@/http/plugins/better-auth'
import { unwrapOrThrow } from '@/shared/result'
import { serializeJournal } from '@/shared/serializer'

const createJournalSchema = z.object({
  content: z.string().min(1).max(1000),
})

const createJournalResponse = createSelectSchema(journals, {
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
}).extend({
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

    return status(202, serializeJournal(journal))
  },
  {
    auth: true,
    detail: {
      tags: ['journal'],
      summary: 'Create and queue a new journal entry',
      description:
        'Create and queue a new journal entry for the authenticated user',
      operationId: 'createJournal',
    },
    body: createJournalSchema,
    response: {
      202: createJournalResponse,
      400: z.object({ error: z.string(), message: z.string() }),
    },
  },
)
