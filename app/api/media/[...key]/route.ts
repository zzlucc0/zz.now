import { NextRequest, NextResponse } from 'next/server'
import { minioClient } from '@/lib/storage/minio'

const BUCKET_NAME = process.env.MINIO_BUCKET || 'personal-platform'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params
    const objectKey = key.join('/')

    // Stream the object from MinIO
    const stream = await minioClient.getObject(BUCKET_NAME, objectKey)
    
    // Get object metadata for content type
    const stat = await minioClient.statObject(BUCKET_NAME, objectKey)
    
    // Create response with proper headers
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': stat.metaData['content-type'] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Media proxy error:', error)
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    )
  }
}
