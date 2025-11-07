import { Elysia } from 'elysia'
import { createJournal } from './create-journal'
import { getJournal } from './get-journal'
import { listJournals } from './list-journals'

export const privateRoutes = new Elysia()
  .use(createJournal)
  .use(getJournal)
  .use(listJournals)
