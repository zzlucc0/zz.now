import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/config'
import { createReactionSchema } from '@/lib/validations/schemas'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createReactionSchema.parse(body)

    if (!validated.postId && !validated.commentId) {
      return NextResponse.json(
        { error: 'Either postId or commentId is required' },
        { status: 400 }
      )
    }

    if (validated.postId && validated.commentId) {
      return NextResponse.json(
        { error: 'Cannot react to both post and comment' },
        { status: 400 }
      )
    }

    const existingReaction = await prisma.reaction.findFirst({
      where: {
        userId: session.user.id,
        type: validated.type,
        ...(validated.postId && { postId: validated.postId }),
        ...(validated.commentId && { commentId: validated.commentId }),
      },
    })

    if (existingReaction) {
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      })
      return NextResponse.json({ message: 'Reaction removed' })
    }

    const reaction = await prisma.reaction.create({
      data: {
        type: validated.type,
        userId: session.user.id,
        postId: validated.postId,
        commentId: validated.commentId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    })

    return NextResponse.json({ reaction }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error },
        { status: 400 }
      )
    }

    console.error('Create reaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
