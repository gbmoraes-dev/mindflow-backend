import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { z } from 'zod/v4'
import { BetterAuthOpenAPI } from './better-auth'

const [authPaths, authComponents] = await Promise.all([
  BetterAuthOpenAPI.getPaths('/auth'),
  BetterAuthOpenAPI.components,
])

export const openapiPlugin = new Elysia({ name: 'openapi' }).use(
  openapi({
    exclude: {
      methods: ['OPTIONS'],
      paths: ['/', '/*'],
    },
    documentation: {
      info: {
        title: 'MindFlow',
        description: '',
        version: '1.0.0',
      },
      tags: [
        {
          name: 'Auth',
          description: 'Authentication endpoints',
        },
      ],
      paths: authPaths,
      components: authComponents,
    },
    mapJsonSchema: {
      zod: z.toJSONSchema,
    },
  }),
)
