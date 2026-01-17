import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { canModifyComment } from '@/lib/auth/authorization'
import { createAuditLog } from '@/lib/utils/audit'
import { z } from 'zod'

const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
})

// PATCH /api/comments/[id] - Update comments
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
    const canModify = await canModifyComment(id, session.user.id, session.user.role)
    if (!canModify) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateCommentSchema.parse(body)

    const comment = await prisma.comment.update({
      where: { id },
      data: { content: validated.content },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: 'COMMENT_UPDATED',
      resource: 'comment',
      resourceId: id,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({ comment })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Update comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/comments/[id] - Delete comment
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

    // Check ownership (owner or admin can delete)
    const canModify = await canModifyComment(id, session.user.id, session.user.role)
    if (!canModify) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { content: true, authorId: true },
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    await prisma.comment.delete({ where: { id } })

    await createAuditLog({
      userId: session.user.id,
      action: 'COMMENT_DELETED',
      resource: 'comment',
      resourceId: id,
      metadata: { 
        wasOwnComment: comment.authorId === session.user.id,
        byAdmin: session.user.role === 'ADMIN',
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({ success: true, message: 'Comment deleted' })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
