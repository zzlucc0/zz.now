import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { createAuditLog } from '@/lib/utils/audit'

// DELETE /api/admin/posts/[id] - Admin delete any post
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

    const post = await prisma.post.findUnique({
      where: { id },
      select: { title: true, authorId: true, slug: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    await prisma.post.delete({ where: { id } })

    await createAuditLog({
      userId: session.user.id,
      action: 'ADMIN_DELETE_POST',
      resource: 'post',
      resourceId: id,
      metadata: {
        title: post.title,
        authorId: post.authorId,
        slug: post.slug,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Post deleted by admin' 
    })
  } catch (error) {
    console.error('Admin delete post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
