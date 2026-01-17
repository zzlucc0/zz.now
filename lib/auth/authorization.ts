import { NextResponse } from 'next/server'
import { auth } from './config'
import { prisma } from '@/lib/db/prisma'

/**
 * Require authentication - returns session or throws 401
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session
}

/**
 * Require specific role - throws 403 if role doesn't match
 */
export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth()
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Forbidden')
  }
  return session
}

/**
 * Require ADMIN role
 */
export async function requireAdmin() {
  return requireRole(['ADMIN'])
}

/**
 * Check if user can modify a post (owner or admin)
 */
export async function canModifyPost(postId: string, userId: string, userRole: string): Promise<boolean> {
  if (userRole === 'ADMIN') {
    return true
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  })

  return post?.authorId === userId
}

/**
 * Check if user can modify a comment (owner or admin)
 */
export async function canModifyComment(commentId: string, userId: string, userRole: string): Promise<boolean> {
  if (userRole === 'ADMIN') {
    return true
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  })

  return comment?.authorId === userId
}

/**
 * Check if user can modify an emoji (owner only, unless admin)
 */
export async function canModifyEmoji(emojiId: string, userId: string, userRole: string): Promise<boolean> {
  if (userRole === 'ADMIN') {
    return true
  }

  const emoji = await prisma.customEmoji.findUnique({
    where: { id: emojiId },
    select: { ownerId: true },
  })

  return emoji?.ownerId === userId
}

/**
 * Error response helper for authorization failures
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}
