import { describe, it, expect } from '@jest/globals'

describe('End-to-End User Flows', () => {
  describe('User Registration and Login Flow', () => {
    it('should allow complete user registration and login', async () => {
      // 1. Register a new user
      const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'e2euser',
          email: 'e2e@example.com',
          password: 'E2ETest123!',
        }),
      })
      
      expect(registerResponse.status).toBe(201)
      const registerData = await registerResponse.json()
      expect(registerData.success).toBe(true)
      
      // 2. User should be able to access /api/me
      const meResponse = await fetch('http://localhost:3000/api/me')
      expect(meResponse.status).toBe(200)
    })
  })

  describe('Post Creation and Publishing Flow', () => {
    it('should allow complete post creation workflow', async () => {
      // 1. Create a draft post
      const createResponse = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'E2E Test Post',
          content: '# Test Content\n\nThis is a test.',
          status: 'DRAFT',
          visibility: 'PUBLIC',
        }),
      })
      
      const createData = await createResponse.json()
      expect(createResponse.status).toBe(201)
      const postId = createData.data.post.id
      const slug = createData.data.post.slug
      
      // 2. Update to published
      const updateResponse = await fetch(`http://localhost:3000/api/posts/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PUBLISHED',
        }),
      })
      
      expect(updateResponse.status).toBe(200)
      
      // 3. Verify post is now in public listing
      const listResponse = await fetch('http://localhost:3000/api/posts')
      const listData = await listResponse.json()
      const publishedPost = listData.data.posts.find((p: any) => p.id === postId)
      expect(publishedPost).toBeDefined()
      expect(publishedPost.status).toBe('PUBLISHED')
    })
  })

  describe('Comment and Reaction Flow', () => {
    it('should allow users to comment and react to posts', async () => {
      // Assuming a post exists from previous test
      const postsResponse = await fetch('http://localhost:3000/api/posts?limit=1')
      const postsData = await postsResponse.json()
      const postId = postsData.data.posts[0].id
      
      // 1. Add a comment
      const commentResponse = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: 'Great post!',
        }),
      })
      
      expect(commentResponse.status).toBe(201)
      
      // 2. Add a reaction
      const reactionResponse = await fetch('http://localhost:3000/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          type: 'LIKE',
        }),
      })
      
      expect(reactionResponse.status).toBe(201)
      
      // 3. Verify reaction and comment count
      const postResponse = await fetch(`http://localhost:3000/api/posts/${postsData.data.posts[0].slug}`)
      const postData = await postResponse.json()
      expect(postData.data.post._count.comments).toBeGreaterThan(0)
      expect(postData.data.post._count.reactions).toBeGreaterThan(0)
    })
  })

  describe('Media Upload Flow', () => {
    it('should allow presigned URL creation and media upload', async () => {
      // 1. Request presigned URL
      const presignResponse = await fetch('http://localhost:3000/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'test-image.jpg',
          contentType: 'image/jpeg',
        }),
      })
      
      expect(presignResponse.status).toBe(200)
      const presignData = await presignResponse.json()
      expect(presignData.data.uploadUrl).toBeDefined()
      expect(presignData.data.key).toBeDefined()
    })
  })
})
