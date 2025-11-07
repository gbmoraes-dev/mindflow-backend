import { Elysia } from 'elysia'
import { createJournal } from './create-journal'

export const privateRoutes = new Elysia().use(createJournal)
