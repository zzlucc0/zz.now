import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { createAuditLog } from '@/lib/utils/audit'

// DELETE /api/admin/comments/[id] - Admin delete any comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { content: true, authorId: true, postId: true },
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    await prisma.comment.delete({ where: { id } })

    await createAuditLog({
      userId: session.user.id,
      action: 'ADMIN_DELETE_COMMENT',
      resource: 'comment',
      resourceId: id,
      metadata: {
        authorId: comment.authorId,
        postId: comment.postId,
        contentPreview: comment.content.substring(0, 100),
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Comment deleted by admin' 
    })
  } catch (error) {
    console.error('Admin delete comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
