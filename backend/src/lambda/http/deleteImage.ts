import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { deleteImage } from '../../helpers/todos'

const logger = createLogger('deleteImageHandler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters?.todoId
    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid TodoId param' })
      }
    }
    logger.info(`deleteImageHandler receives request to delete image with todoId: ${todoId}`)
    await deleteImage(todoId)
    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
