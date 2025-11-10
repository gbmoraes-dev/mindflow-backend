import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { openAPI } from 'better-auth/plugins'
import { redis } from 'bun'
import { db } from './db'
import { env } from './env'

export const auth = betterAuth({
  basePath: '/auth',
  trustedOrigins: [env.ORIGIN],
  plugins: [openAPI()],
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    password: {
      hash: (password: string) => Bun.password.hash(password),
      verify: ({ password, hash }) => Bun.password.verify(password, hash),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  secondaryStorage: {
    get: async (key: string) => {
      return await redis.get(key)
    },
    set: async (key: string, value: string, ttl?: number) => {
      await redis.set(key, value)

      if (ttl) {
        await redis.expire(key, ttl)
      }
    },
    delete: async (key: string) => {
      await redis.del(key)
    },
  },
})
