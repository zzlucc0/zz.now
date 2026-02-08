import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { setupTestDatabase, teardownTestDatabase, createTestUser, createTestPost } from '../setup'

describe('Comments API', () => {
  let testUser: any
  let testPost: any

  beforeAll(async () => {
    await setupTestDatabase()
    testUser = await createTestUser({
      username: 'commenter',
      email: 'commenter@example.com',
      password: process.env.TEST_USER_PASSWORD,
    })
    testPost = await createTestPost(testUser.id, {
      title: 'Post with Comments',
      content: 'Content',
      slug: 'post-with-comments',
      status: 'PUBLISHED',
    })
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  describe('POST /api/comments', () => {
    it('should create a comment on a post', async () => {
      const response = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: testPost.id,
          content: 'This is a test comment',
        }),
      })

      const data = await response.json()
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.comment.content).toBe('This is a test comment')
    })

    it('should create a nested comment (reply)', async () => {
      // First create a parent comment
      const parentResponse = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: testPost.id,
          content: 'Parent comment',
        }),
      })
      const parentData = await parentResponse.json()
      const parentId = parentData.data.comment.id

      // Then create a reply
      const replyResponse = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: testPost.id,
          content: 'Reply to parent',
          parentId: parentId,
        }),
      })

      const replyData = await replyResponse.json()
      expect(replyResponse.status).toBe(201)
      expect(replyData.data.comment.parentId).toBe(parentId)
    })

    it('should reject empty comment content', async () => {
      const response = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: testPost.id,
          content: '',
        }),
      })

      expect(response.status).toBe(400)
    })
  })
})
