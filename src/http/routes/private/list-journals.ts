import { createSelectSchema } from 'drizzle-zod'
import { Elysia } from 'elysia'
import { z } from 'zod/v4'
import { journals } from '@/db/schema/journals'
import { listJournalsUseCase } from '@/domain/use-cases/list-journals'
import { betterAuthPlugin } from '@/http/plugins/better-auth'
import { unwrapOrThrow } from '@/shared/result'
import { serializeJournals } from '@/shared/serializer'

const listJournalsResponse = z.array(
  createSelectSchema(journals, {
    createdAt: z.coerce.string(),
    updatedAt: z.coerce.string(),
  }).extend({
    aiAnalysis: z.unknown().nullable().optional(),
  }),
)

export const listJournals = new Elysia().use(betterAuthPlugin).get(
  '/journal',
  async ({ user, status }) => {
    const result = await listJournalsUseCase({
      userId: user.id,
    })

    const journals = unwrapOrThrow(result)

    return status(200, serializeJournals(journals))
  },
  {
    auth: true,
    detail: {
      tags: ['journal'],
      summary: 'List a journal entries',
      description: 'List all journal entries for the authenticated user',
      operationId: 'listJournals',
    },
    response: {
      200: listJournalsResponse,
    },
  },
)
