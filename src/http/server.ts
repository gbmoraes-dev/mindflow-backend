import { Elysia } from 'elysia'
import { env } from '@/env'
import { tracing } from '@/tracing'
import { betterAuthPlugin } from './plugins/better-auth'
import { corsPlugin } from './plugins/cors'
import { openapiPlugin } from './plugins/openapi'
import { publicRoutes } from './routes/public'

const app = new Elysia()
  .use(tracing)
  .use(corsPlugin)
  .use(openapiPlugin)
  .use(betterAuthPlugin)
  .use(publicRoutes)
  .listen({ hostname: env.HOST, port: env.PORT })

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
