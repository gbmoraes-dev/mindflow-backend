import { broker } from '../broker'

export const journals = await broker.createChannel()

await journals.assertQueue('journals')
