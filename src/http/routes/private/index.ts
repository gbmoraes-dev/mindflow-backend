import { Elysia } from 'elysia'
import { createJournal } from './create-journal'
import { getJournal } from './get-journal'

export const privateRoutes = new Elysia().use(createJournal).use(getJournal)
