import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

// GET /api/emojis - List user's emojis
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const emojis = await prisma.customEmoji.findMany({
      where: {
        ownerId: session.user.id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        objectKey: true,
        keywords: true,
        createdAt: true,
      },
    })

    // Add public URLs
    const emojisWithUrls = emojis.map(emoji => ({
      ...emoji,
      url: `${process.env.PUBLIC_MEDIA_BASE_URL || '/api/media'}/${emoji.objectKey}`,
    }))

    return NextResponse.json({ emojis: emojisWithUrls })
  } catch (error) {
    console.error('Get emojis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
