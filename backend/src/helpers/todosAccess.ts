import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
  constructor(private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
              private readonly todosTable = process.env.TODOS_TABLE,
              private readonly todoIdIndex = process.env.TODOS_CREATED_AT_INDEX) {
  }

  getAllTodos = async (userId: string): Promise<TodoItem[]> => {
    logger.info('Getting all todo items')
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todoIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      })
      .promise()
    logger.info(`userId: ${userId} has ${result.Items.length} todo items`)
    return result.Items as TodoItem[]
  }

  getTodoById = async (todoId: string): Promise<TodoItem> => {
    logger.info('Getting todo item by id')
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todoIdIndex,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId
      }
    }).promise()
    return result.Items[0] as TodoItem
  }

  createTodoItem = async (todoItem: TodoItem): Promise<TodoItem> => {
    logger.info(`create new todo item with id: ${todoItem.todoId}`)
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()
    return todoItem
  }

  deleteTodo = async (todoId: string, userId: string): Promise<any> => {
    logger.info(`delete item by todoId: ${todoId}`)
    return await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { userId: userId, todoId: todoId }
      }).promise()
  }

  updateTodo = async (todoId: string, userId: string, todoItem: UpdateTodoRequest): Promise<any> => {
    logger.info(`Update todo item with todoId: ${todoId} for userId: ${userId}`)
    const updateTodoItem = await this.docClient.update({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'SET #name = :name, #dueDate = :dueDate, #done = :done',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ExpressionAttributeValues: {
        ':name': todoItem.name,
        ':dueDate': todoItem.dueDate,
        ':done': todoItem.done
      },
      ReturnValues: 'UPDATED_NEW'
    }).promise()
    return updateTodoItem.Attributes as TodoUpdate
  }

  updateAttachmentUrl = async (todoId: string, userId: string, attachmentUrl: string): Promise<any> => {
    return this.docClient.update({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()
  }

}
