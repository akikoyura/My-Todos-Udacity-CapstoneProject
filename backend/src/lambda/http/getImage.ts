import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { downloadImage } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('GetImageHandler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters?.todoId
    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid TodoId param' })
      }
    }
    logger.info(`getImageHandler receives request to download image with todoId: ${todoId}`)
    const image = downloadImage(todoId)
    return {
      statusCode: 200,
      body: JSON.stringify({ item: image })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
