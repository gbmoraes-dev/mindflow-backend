import { eq } from 'drizzle-orm'
import { ok } from 'neverthrow'
import { db } from '@/db'
import { schema } from '@/db/schema'

export interface ListJournalsInput {
  userId: string
}

export const listJournalsUseCase = async ({ userId }: ListJournalsInput) => {
  const journals = await db
    .select()
    .from(schema.journals)
    .where(eq(schema.journals.userId, userId))

  return ok(journals)
}
