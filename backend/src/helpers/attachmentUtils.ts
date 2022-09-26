import * as AWS from 'aws-sdk'
import * as process from 'process'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

export class AttachmentUtils {
  constructor(
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly bucketName: string = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration: string = process.env.SIGNED_URL_EXPIRATION
  ) {
  }

  getUploadUrl = (todoId: string): string => {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: Number(this.urlExpiration)
    })
  }

  getAttachmentUrl = (todoId: string): string => {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
  }

  getImage = (todoId: string): string => {
    return this.s3.getSignedUrl('getObject', { Bucket: this.bucketName, Key: todoId })
  }

  deleteImage = async (todoId: string): Promise<any> => {
    return this.s3.deleteObject({ Bucket: this.bucketName, Key: todoId }).promise()
  }
}
