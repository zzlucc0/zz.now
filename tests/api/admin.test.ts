import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { setupTestDatabase, teardownTestDatabase, createTestUser, createTestPost, prisma } from '../setup'

describe('Admin API', () => {
  let adminUser: any
  let regularUser: any
  let testPost: any
  let testComment: any

  beforeAll(async () => {
    await setupTestDatabase()
    adminUser = await createTestUser({
      username: 'adminuser',
      email: 'adminuser@example.com',
      password: 'Admin123!',
      role: 'ADMIN',
    })
    regularUser = await createTestUser({
      username: 'regularuser',
      email: 'regular@example.com',
      password: 'User123!',
    })
    testPost = await createTestPost(regularUser.id, {
      title: 'Test Post',
      content: 'Content',
      slug: 'test-admin-post',
      status: 'PUBLISHED',
    })
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  describe('DELETE /api/admin/posts/[id]', () => {
    it('should allow admin to delete any post', async () => {
      const response = await fetch(`http://localhost:3000/api/admin/posts/${testPost.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify post is deleted
      const deletedPost = await prisma.post.findUnique({
        where: { id: testPost.id },
      })
      expect(deletedPost).toBeNull()
    })

    it('should reject non-admin users', async () => {
      const post = await createTestPost(regularUser.id, {
        title: 'Another Post',
        content: 'Content',
        slug: 'another-post',
        status: 'PUBLISHED',
      })

      const response = await fetch(`http://localhost:3000/api/admin/posts/${post.id}`, {
        method: 'DELETE',
      })

      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/admin/audit', () => {
    it('should return audit logs', async () => {
      // Create an audit log
      await prisma.auditLog.create({
        data: {
          action: 'DELETE_POST',
          userId: adminUser.id,
          details: { postId: testPost.id },
        },
      })

      const response = await fetch('http://localhost:3000/api/admin/audit')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.logs.length).toBeGreaterThan(0)
    })

    it('should filter audit logs by action', async () => {
      const response = await fetch('http://localhost:3000/api/admin/audit?action=DELETE_POST')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.logs.every((log: any) => log.action === 'DELETE_POST')).toBe(true)
    })
  })
})
