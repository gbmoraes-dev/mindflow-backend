import amqp from 'amqplib'
import { env } from '@/env'

export const broker = await amqp.connect(env.BROKER_URL)
