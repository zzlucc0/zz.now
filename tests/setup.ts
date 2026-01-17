import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/lib/auth/password'

export const prisma = new PrismaClient()

export async function setupTestDatabase() {
  // Clean all tables
  await prisma.postMedia.deleteMany()
  await prisma.reaction.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.customEmoji.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany()
}

export async function createTestUser(data: {
  username: string
  email: string
  password: string
  role?: 'USER' | 'ADMIN'
}) {
  const passwordHash = await hashPassword(data.password)
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      passwordHash,
      displayName: data.username,
      role: data.role || 'USER',
    },
  })
}

export async function createTestPost(userId: string, data: {
  title: string
  content: string
  slug: string
  status?: 'DRAFT' | 'PUBLISHED'
  visibility?: 'PUBLIC' | 'UNLISTED' | 'PRIVATE'
}) {
  return prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      slug: data.slug,
      authorId: userId,
      status: data.status || 'PUBLISHED',
      visibility: data.visibility || 'PUBLIC',
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
    },
  })
}

export async function teardownTestDatabase() {
  await prisma.$disconnect()
}
