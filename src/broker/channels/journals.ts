import { broker } from '../broker.ts'

export const journals = await broker.createChannel()

await journals.assertQueue('journals')
