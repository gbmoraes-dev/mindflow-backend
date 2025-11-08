import { err, ok } from 'neverthrow'
import type { JournalCreatedMessage } from '@/contracts/messages/journal-created-message'
import { CouldNotCreateError } from '@/domain/errors/could-not-create'
import { channels } from '../channels/index'

export function dispatchJournalCreated(data: JournalCreatedMessage) {
  const queued = channels.journals.sendToQueue(
    'journals',
    Buffer.from(JSON.stringify(data)),
    { persistent: true },
  )

  if (!queued) {
    return err(new CouldNotCreateError('Failed to queue journal creation.'))
  }

  return ok(queued)
}
