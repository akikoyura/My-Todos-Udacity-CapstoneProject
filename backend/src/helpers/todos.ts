import { TodosAccess } from './todosAccess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('TodoBusiness')
const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {

  return todoAccess.getAllTodos(userId)
}

export const createTodo = async (newTodo: CreateTodoRequest, userId: string): Promise<TodoItem> => {
  const todoId = uuid.v4()
  logger.info(`Starting create todo item with todoId: ${todoId}`)
  const createdAt = new Date().toISOString()
  const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
  const newItem = await todoAccess.createTodoItem(
    { userId, todoId, createdAt, ...newTodo, done: false, attachmentUrl }
  )
  logger.info(`Storing new item: ${newItem} `)
  return newItem
}

export const deleteTodoItem = async (todoId: string, userId: string): Promise<any> => {
  const response = await todoAccess.deleteTodo(todoId, userId)
  logger.info(`Delete todo item with todoId: ${todoId}`)
  return response
}

export const updateTodoItem = async (updateTodo: UpdateTodoRequest, userId: string, todoId: string): Promise<any> => {
  const response = await todoAccess.updateTodo(todoId, userId, updateTodo)
  logger.info(`Update todo item with todoId: ${todoId}`)
  return response
}

export const createAttachmentPresignedUrl = (todoId: string): string => {
  logger.info('Starting generate attachment URL')
  return attachmentUtils.getUploadUrl(todoId)
}

export const updateAttachmentUrl = async (userId: string, todoId: string, attachmentUrl: string): Promise<any> => {
  logger.info('Starting attach attachmentUrl')
  return await todoAccess.updateAttachmentUrl(todoId, userId, attachmentUrl)
}

export const downloadImage = (todoId: string): string => {
  logger.info('Starting download image with todoId: ', todoId)
  return attachmentUtils.getImage(todoId)
}

export const deleteImage = async (todoId: string): Promise<any> => {
  logger.info('Starting delete image with todoId: ', todoId)
  return attachmentUtils.deleteImage(todoId)
}
