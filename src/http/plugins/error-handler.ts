import { Elysia } from 'elysia'
import { CouldNotCreateError } from '@/domain/errors/could-not-create'

export const errorHandler = new Elysia({ name: 'error-handler' }).onError(
  ({ error, status }) => {
    if (error instanceof CouldNotCreateError) {
      return status(400, { error: 'Could not create', message: error.message })
    }

    return status(500, {
      error: 'Internal Server Error',
      message: 'An unexpected error has occurred. Please try again later.',
    })
  },
)
