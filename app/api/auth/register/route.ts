import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { hashPassword } from '@/lib/auth/password'
import { registerSchema } from '@/lib/validations/schemas'
import { createAuditLog } from '@/lib/utils/audit'
import { z } from 'zod'

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
      const field = existingUser.email === validated.email ? 'email' : 'username'
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'USER_EXISTS',
            message: `A user with this ${field} already exists`,
            field,
          },
        },
        { status: 409 }
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

    return NextResponse.json(
      {
        success: true,
        data: { user },
        error: null,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {}
      error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        fieldErrors[field] = issue.message
      })

      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please check your input',
            fields: fieldErrors,
            details: error.issues,
          },
        },
        { status: 400 }
      )
    }
    
    console.error('Registration error:', error)
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during registration',
        },
      },
      { status: 500 }
    )
  }
}
