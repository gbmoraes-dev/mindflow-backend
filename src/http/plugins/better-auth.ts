// biome-ignore-all lint/suspicious/noAssignInExpressions: reason
// biome-ignore-all lint/suspicious/noExplicitAny: reason

import { Elysia } from 'elysia'
import { auth } from '@/auth'

export const betterAuthPlugin = new Elysia({ name: 'better-auth' })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers })

        if (!session) {
          return status(401, { message: 'Unauthorized' })
        }

        return {
          user: session.user,
          session: session.session,
        }
      },
    },
  })

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

export const BetterAuthOpenAPI = {
  getPaths: (prefix = '/auth') =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null)

      for (const path of Object.keys(paths)) {
        const pathItem = paths[path]

        if (!pathItem) {
          continue
        }

        const key = prefix + path
        reference[key] = pathItem

        for (const keyInPath of Object.keys(pathItem)) {
          const operation = (pathItem as any)[keyInPath]

          if (
            operation &&
            typeof operation === 'object' &&
            !Array.isArray(operation)
          ) {
            operation.tags = ['Better Auth']
          }
        }
      }

      return reference
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const
