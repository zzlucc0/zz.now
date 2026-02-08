import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { setupTestDatabase, teardownTestDatabase, createTestUser, createTestPost, prisma } from '../setup'

describe('Reactions API', () => {
  let testUser: any
  let testPost: any

  beforeAll(async () => {
    await setupTestDatabase()
    testUser = await createTestUser({
      username: 'reactor',
      email: 'reactor@example.com',
      password: process.env.TEST_USER_PASSWORD,
    })
    testPost = await createTestPost(testUser.id, {
      title: 'Post to React',
      content: 'Content',
      slug: 'post-to-react',
      status: 'PUBLISHED',
    })
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  describe('POST /api/reactions', () => {
    it('should add a reaction to a post', async () => {
      const response = await fetch('http://localhost:3000/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: testPost.id,
          type: 'LIKE',
        }),
      })

      const data = await response.json()
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.reaction.type).toBe('LIKE')
    })

    it('should toggle reaction (remove if exists)', async () => {
      // First add reaction
      await fetch('http://localhost:3000/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: testPost.id,
          type: 'LOVE',
        }),
      })

      // Then toggle it (should remove)
      const response = await fetch('http://localhost:3000/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: testPost.id,
          type: 'LOVE',
        }),
      })

      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.data.action).toBe('removed')
    })

    it('should reject invalid reaction type', async () => {
      const response = await fetch('http://localhost:3000/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: testPost.id,
          type: 'INVALID',
        }),
      })

      expect(response.status).toBe(400)
    })
  })
})
