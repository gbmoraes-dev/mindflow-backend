import type { JournalCreatedMessage } from '@/domain/contracts/messages/journal-created-message'
import { channels } from '../channels/index'

export function dispatchJournalCreated(data: JournalCreatedMessage) {
  channels.journals.sendToQueue('journals', Buffer.from(JSON.stringify(data)), {
    persistent: true,
  })
}
