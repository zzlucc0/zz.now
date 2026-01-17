import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { canModifyEmoji } from '@/lib/auth/authorization'
import { deleteFile } from '@/lib/storage/minio'
import { z } from 'zod'

const updateEmojiSchema = z.object({
  name: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  keywords: z.string().optional(),
})

// PATCH /api/emojis/[id] - Update emoji
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check ownership
    const canModify = await canModifyEmoji(id, session.user.id, session.user.role)
    if (!canModify) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateEmojiSchema.parse(body)

    // Check if new name conflicts with existing emoji for this user
    if (validated.name) {
      const existing = await prisma.customEmoji.findFirst({
        where: {
          ownerId: session.user.id,
          name: validated.name,
          id: { not: id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'You already have an emoji with this name' },
          { status: 400 }
        )
      }
    }

    const emoji = await prisma.customEmoji.update({
      where: { id },
      data: validated,
      select: {
        id: true,
        name: true,
        objectKey: true,
        keywords: true,
      },
    })

    return NextResponse.json({
      emoji: {
        ...emoji,
        url: `${process.env.PUBLIC_MEDIA_BASE_URL || '/api/media'}/${emoji.objectKey}`,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Update emoji error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/emojis/[id] - Delete emoji
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check ownership
    const canModify = await canModifyEmoji(id, session.user.id, session.user.role)
    if (!canModify) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const emoji = await prisma.customEmoji.findUnique({
      where: { id },
      select: { objectKey: true },
    })

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji not found' }, { status: 404 })
    }

    // Delete from database
    await prisma.customEmoji.delete({ where: { id } })

    // Delete from storage (fire and forget)
    deleteFile(emoji.objectKey).catch(err => 
      console.error('Failed to delete emoji file:', err)
    )

    return NextResponse.json({ success: true, message: 'Emoji deleted' })
  } catch (error) {
    console.error('Delete emoji error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
