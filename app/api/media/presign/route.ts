import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getPresignedUploadUrl } from '@/lib/storage/minio'
import { z } from 'zod'

const presignSchema = z.object({
  purpose: z.enum(['POST_IMAGE', 'AVATAR', 'EMOJI']),
  filename: z.string().min(1).max(255),
  mimeType: z.string(),
  size: z.number().positive(),
})

// MIME type allowlists by purpose
const ALLOWED_MIMES = {
  POST_IMAGE: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
  AVATAR: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  EMOJI: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
}

// Size limits in bytes by purpose
const SIZE_LIMITS = {
  POST_IMAGE: 10 * 1024 * 1024, // 10MB
  AVATAR: 5 * 1024 * 1024, // 5MB
  EMOJI: 5 * 1024 * 1024, // 5MB
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = presignSchema.parse(body)

    // Validate MIME type
    const allowedMimes = ALLOWED_MIMES[validated.purpose]
    if (!allowedMimes.includes(validated.mimeType)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type',
          details: `Allowed types: ${allowedMimes.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Validate file size
    const sizeLimit = SIZE_LIMITS[validated.purpose]
    if (validated.size > sizeLimit) {
      return NextResponse.json(
        { 
          error: 'File too large',
          details: `Maximum size: ${Math.round(sizeLimit / 1024 / 1024)}MB` 
        },
        { status: 400 }
      )
    }

    // Generate unique object key
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = validated.filename.split('.').pop()
    const objectKey = `${validated.purpose.toLowerCase()}/${session.user.id}/${timestamp}-${randomString}.${extension}`

    // Get presigned upload URL
    const uploadUrl = await getPresignedUploadUrl(objectKey, 3600) // 1 hour expiry

    // Public URL that will be used after upload
    const publicUrl = `${process.env.PUBLIC_MEDIA_BASE_URL || '/api/media'}/${objectKey}`

    return NextResponse.json({
      uploadUrl,
      objectKey,
      publicUrl,
      expiresIn: 3600,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Presign upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
