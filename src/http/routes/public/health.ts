import { Elysia } from 'elysia'

export const health = new Elysia().get('/healthz', ({ status }) => {
  return status(200, {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})
