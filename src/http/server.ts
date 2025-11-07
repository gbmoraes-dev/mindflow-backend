import { Elysia } from 'elysia'
import { env } from '@/env'
import { tracing } from '@/tracing'
import { betterAuthPlugin } from './plugins/better-auth'
import { corsPlugin } from './plugins/cors'
import { errorHandler } from './plugins/error-handler'
import { openapiPlugin } from './plugins/openapi'
import { privateRoutes } from './routes/private'
import { publicRoutes } from './routes/public'

const app = new Elysia()
  .use(tracing)
  .use(corsPlugin)
  .use(openapiPlugin)
  .use(errorHandler)
  .use(betterAuthPlugin)
  .use(publicRoutes)
  .use(privateRoutes)
  .listen({ hostname: env.HOST, port: env.PORT })

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
