import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/config'
import { createPostSchema } from '@/lib/validations/schemas'
import { generateSlug } from '@/lib/utils/helpers'
import { createAuditLog } from '@/lib/utils/audit'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'PUBLISHED'
    const tag = searchParams.get('tag')

    const skip = (page - 1) * limit

    const where: any = {
      status,
      visibility: 'PUBLIC',
    }

    if (tag) {
      where.tags = {
        some: {
          slug: tag,
        },
      }
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          tags: true,
          _count: {
            select: {
              comments: true,
              reactions: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createPostSchema.parse(body)

    let slug = generateSlug(validated.title)
    
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    })

    if (existingPost) {
      slug = `${slug}-${Date.now()}`
    }

    const post = await prisma.post.create({
      data: {
        title: validated.title,
        slug,
        content: validated.content,
        excerpt: validated.excerpt,
        status: validated.status,
        visibility: validated.visibility,
        authorId: session.user.id,
        publishedAt: validated.status === 'PUBLISHED' ? new Date() : null,
        tags: validated.tags
          ? {
              connectOrCreate: validated.tags.map((tag) => ({
                where: { slug: generateSlug(tag) },
                create: {
                  name: tag,
                  slug: generateSlug(tag),
                },
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        tags: true,
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: 'POST_CREATED',
      resource: 'post',
      resourceId: post.id,
      metadata: { title: post.title, status: post.status },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error },
        { status: 400 }
      )
    }

    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
