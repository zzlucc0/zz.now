import { Client } from 'minio'

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY ?? '',
  secretKey: process.env.MINIO_SECRET_KEY ?? '',
})

const BUCKET_NAME = process.env.MINIO_BUCKET || 'personal-platform'

export async function initializeBucket() {
  const exists = await minioClient.bucketExists(BUCKET_NAME)
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, 'us-east-1')
    
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    }
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy))
  }
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  await minioClient.putObject(BUCKET_NAME, fileName, file, file.length, {
    'Content-Type': contentType,
  })
  
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost'
  const port = process.env.MINIO_PORT || '9000'
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'
  
  return `${protocol}://${endpoint}:${port}/${BUCKET_NAME}/${fileName}`
}

export async function deleteFile(fileName: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, fileName)
}

/**
 * Generate presigned URL for file upload
 */
export async function getPresignedUploadUrl(
  objectKey: string,
  expirySeconds = 3600
): Promise<string> {
  return await minioClient.presignedPutObject(
    BUCKET_NAME,
    objectKey,
    expirySeconds
  )
}

/**
 * Generate presigned URL for file download
 */
export async function getPresignedDownloadUrl(
  objectKey: string,
  expirySeconds = 3600
): Promise<string> {
  return await minioClient.presignedGetObject(
    BUCKET_NAME,
    objectKey,
    expirySeconds
  )
}

/**
 * Get public URL for an object (if bucket is public)
 */
export function getPublicUrl(objectKey: string): string {
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost'
  const port = process.env.MINIO_PORT || '9000'
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'
  
  return `${protocol}://${endpoint}:${port}/${BUCKET_NAME}/${objectKey}`
}

/**
 * Check if object exists
 */
export async function objectExists(objectKey: string): Promise<boolean> {
  try {
    await minioClient.statObject(BUCKET_NAME, objectKey)
    return true
  } catch {
    return false
  }
}

export { minioClient }
