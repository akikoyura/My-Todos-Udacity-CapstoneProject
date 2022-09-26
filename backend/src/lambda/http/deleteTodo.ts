import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodoItem } from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('DeleteTodoHandler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters?.todoId
    const userId = getUserId(event)
    logger.info(`Handler receives delete todo item request with id ${todoId}`)
    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid TodoId param' })
      }
    }
    await deleteTodoItem(todoId, userId)
    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
