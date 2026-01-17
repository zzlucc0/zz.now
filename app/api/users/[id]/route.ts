import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/users/[id] - Get public user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED',
                visibility: 'PUBLIC',
              },
            },
            comments: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
