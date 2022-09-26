import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodoItem } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('UpdateTodoHandler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters?.todoId
  const userId = getUserId(event)
  logger.info(`UpdateTodoHandler receives request to update todo item with todoId: ${todoId}`)

  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid TodoId param' })
    }
  }
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  await updateTodoItem(updatedTodo, userId, todoId)
  logger.info('Todo item updated')
  return {
    statusCode: 200,
    body: JSON.stringify({})
  }

})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
