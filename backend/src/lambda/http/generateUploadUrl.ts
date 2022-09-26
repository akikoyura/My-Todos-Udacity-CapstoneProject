import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createAttachmentPresignedUrl, updateAttachmentUrl } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('GenerateUploadUrlHandler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters?.todoId
  const userId = getUserId(event)

  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid todoId param' })
    }
  }

  logger.info(`GenerateUploadUrlHandler receives generate upload url for todoId: ${todoId}`)
  const uploadUrl = createAttachmentPresignedUrl(todoId)
  const attachmentUrl = uploadUrl.split('?')[0]
  await updateAttachmentUrl(userId, todoId, attachmentUrl)

  return {
    statusCode: 200,
    body: JSON.stringify({ uploadUrl })
  }
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
