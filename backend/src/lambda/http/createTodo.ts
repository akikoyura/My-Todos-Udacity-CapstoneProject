import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('CreateTodoHandler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    logger.info(`createTodoHandler receives request to create new todo with name: ${newTodo.name}`)
    const todoItem = await createTodo(newTodo, userId)
    return {
      statusCode: 201,
      body: JSON.stringify({ item: todoItem })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
