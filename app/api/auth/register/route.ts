import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { hashPassword } from '@/lib/auth/password'
import { registerSchema } from '@/lib/validations/schemas'
import { createAuditLog } from '@/lib/utils/audit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validated.email },
          { username: validated.username },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(validated.password)

    // Check if user should be ADMIN based on ADMIN_EMAILS
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
    const isAdmin = adminEmails.includes(validated.email.toLowerCase())

    const user = await prisma.user.create({
      data: {
        username: validated.username,
        email: validated.email,
        passwordHash,
        displayName: validated.displayName,
        role: isAdmin ? 'ADMIN' : 'USER',
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'USER_REGISTERED',
      resource: 'user',
      resourceId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error },
        { status: 400 }
      )
    }
    
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
