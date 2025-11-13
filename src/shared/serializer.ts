export function serializeJournal<
  T extends { createdAt: Date; updatedAt?: Date },
>(journal: T) {
  return {
    ...journal,
    createdAt: journal.createdAt.toISOString(),
    ...(journal.updatedAt && { updatedAt: journal.updatedAt.toISOString() }),
  }
}

export function serializeJournals<
  T extends { createdAt: Date; updatedAt?: Date },
>(journals: T[]) {
  return journals.map(serializeJournal)
}
