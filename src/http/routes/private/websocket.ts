import { RedisClient } from 'bun'
import { Elysia } from 'elysia'
import { z } from 'zod/v4'
import { env } from '@/env'

export const websocket = new Elysia()
  .state('subscriber', undefined as RedisClient | undefined)
  .ws('/ws/journal/:journalId', {
    params: z.object({
      journalId: z.string(),
    }),

    async open(ws) {
      const { journalId } = ws.data.params

      const channel = `journal:${journalId}:completed`

      const subscriber = new RedisClient(env.REDIS_URL)

      await subscriber.subscribe(channel, async (message) => {
        const parsedMessage = JSON.parse(message)

        ws.send(JSON.stringify(parsedMessage))

        if (parsedMessage.event === 'analysis_completed') {
          await new Promise((resolve) => setTimeout(resolve, 100))

          await subscriber.unsubscribe(channel)
          ws.close(1000, 'Analysis completed')
        }
      })

      ws.data.store.subscriber = subscriber

      ws.send(
        JSON.stringify({
          type: 'connected',
          journalId,
        }),
      )
    },

    async close(ws) {
      if (ws.data.store.subscriber) {
        await ws.data.store.subscriber.unsubscribe()
      }
    },
  })
