import { Elysia } from 'elysia'
import { health } from './health'

export const publicRoutes = new Elysia().use(health)
