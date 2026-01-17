import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

// GET /api/emojis/search?q=keyword
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (!query) {
      return NextResponse.json({ emojis: [] })
    }

    const emojis = await prisma.customEmoji.findMany({
      where: {
        ownerId: session.user.id,
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { keywords: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        objectKey: true,
        keywords: true,
      },
    })

    const emojisWithUrls = emojis.map(emoji => ({
      ...emoji,
      url: `${process.env.PUBLIC_MEDIA_BASE_URL || '/api/media'}/${emoji.objectKey}`,
    }))

    return NextResponse.json({ emojis: emojisWithUrls })
  } catch (error) {
    console.error('Search emojis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
