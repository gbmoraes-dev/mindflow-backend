import { and, eq } from 'drizzle-orm'
import { err, ok } from 'neverthrow'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { NotFoundError } from '../errors/not-found'

export interface GetJournalInput {
  userId: string
  journalId: string
}

export const getJournalUseCase = async ({
  userId,
  journalId,
}: GetJournalInput) => {
  const [journal] = await db
    .select()
    .from(schema.journals)
    .where(
      and(
        eq(schema.journals.id, journalId),
        eq(schema.journals.userId, userId),
      ),
    )

  if (!journal) {
    return err(new NotFoundError('Journal not found.'))
  }

  return ok(journal)
}
