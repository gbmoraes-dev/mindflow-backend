import { err, ok } from 'neverthrow'
import { dispatchJournalCreated } from '@/broker/messages/journal-created'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { CouldNotCreateError } from '../errors/could-not-create'

export interface CreateJournalInput {
  userId: string
  content: string
}

export const createJournalUseCase = async ({
  userId,
  content,
}: CreateJournalInput) => {
  const [journal] = await db
    .insert(schema.journals)
    .values({ userId, content })
    .returning()

  if (!journal) {
    return err(new CouldNotCreateError('Failed to create journal.'))
  }

  dispatchJournalCreated({
    journalId: journal.id,
    userId,
    content,
  })

  return ok(journal)
}
