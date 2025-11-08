import { z } from 'zod/v4'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().default(3333),
  ORIGIN: z.url(),
  DATABASE_URL: z.url().startsWith('postgresql://'),
  REDIS_URL: z.url().startsWith('redis://'),
  BROKER_URL: z.url().startsWith('amqp://'),
  OPENAI_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),
  SERVICE_NAME: z.string(),
  AXIOM_TOKEN: z.string(),
  AXIOM_DATASET: z.string(),
  TRACE_EXPORTER_URL: z.url(),
})

export const env = envSchema.parse(Bun.env)
