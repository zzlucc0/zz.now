import { prisma } from '@/lib/db/prisma'

export async function createAuditLog(data: {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}) {
  await prisma.auditLog.create({
    data,
  })
}

export async function getAuditLogs(params: {
  userId?: string
  resource?: string
  limit?: number
  offset?: number
}) {
  const { userId, resource, limit = 50, offset = 0 } = params

  return await prisma.auditLog.findMany({
    where: {
      ...(userId && { userId }),
      ...(resource && { resource }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  })
}
