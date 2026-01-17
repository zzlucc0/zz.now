import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { objectExists } from '@/lib/storage/minio'
import { z } from 'zod'

const confirmSchema = z.object({
  objectKey: z.string(),
  purpose: z.enum(['POST_IMAGE', 'AVATAR', 'EMOJI']),
  postId: z.string().cuid().optional(),
  emojiName: z.string().optional(),
  emojiKeywords: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = confirmSchema.parse(body)

    // Verify the object exists in storage
    const exists = await objectExists(validated.objectKey)
    if (!exists) {
      return NextResponse.json(
        { error: 'File not found in storage' },
        { status: 404 }
      )
    }

    const publicUrl = `${process.env.PUBLIC_MEDIA_BASE_URL || '/api/media'}/${validated.objectKey}`

    // Handle different purposes
    if (validated.purpose === 'AVATAR') {
      // Update user avatar
      await prisma.user.update({
        where: { id: session.user.id },
        data: { avatarUrl: publicUrl },
      })

      return NextResponse.json({ 
        success: true,
        avatarUrl: publicUrl 
      })
    }

    if (validated.purpose === 'EMOJI') {
      // Create custom emoji record
      if (!validated.emojiName) {
        return NextResponse.json(
          { error: 'Emoji name is required' },
          { status: 400 }
        )
      }

      const emoji = await prisma.customEmoji.create({
        data: {
          name: validated.emojiName,
          objectKey: validated.objectKey,
          keywords: validated.emojiKeywords || '',
          ownerId: session.user.id,
        },
      })

      return NextResponse.json({
        success: true,
        emoji: {
          id: emoji.id,
          name: emoji.name,
          url: publicUrl,
        },
      })
    }

    if (validated.purpose === 'POST_IMAGE') {
      // Create post media record (if postId provided)
      if (validated.postId) {
        const media = await prisma.postMedia.create({
          data: {
            postId: validated.postId,
            type: 'IMAGE',
            objectKey: validated.objectKey,
          },
        })

        return NextResponse.json({
          success: true,
          media: {
            id: media.id,
            url: publicUrl,
          },
        })
      }

      // If no postId, return URL for use during post creation
      return NextResponse.json({
        success: true,
        objectKey: validated.objectKey,
        url: publicUrl,
      })
    }

    return NextResponse.json({ error: 'Invalid purpose' }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Confirm upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
