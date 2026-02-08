import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { setupTestDatabase, teardownTestDatabase, createTestUser, createTestPost, prisma } from '../setup'

describe('Posts API', () => {
  let testUser: any
  let adminUser: any
  let userToken: string
  let adminToken: string

  beforeAll(async () => {
    await setupTestDatabase()
    testUser = await createTestUser({
      username: 'postuser',
      email: 'postuser@example.com',
      password: process.env.TEST_USER_PASSWORD,
    })
    adminUser = await createTestUser({
      username: 'admin',
      email: 'admin@example.com',
      password: process.env.TEST_ADMIN_PASSWORD,
      role: 'ADMIN',
    })
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  describe('GET /api/posts', () => {
    beforeEach(async () => {
      await prisma.post.deleteMany()
    })

    it('should return list of published posts', async () => {
      await createTestPost(testUser.id, {
        title: 'Published Post',
        content: 'Content',
        slug: 'published-post',
        status: 'PUBLISHED',
      })
      await createTestPost(testUser.id, {
        title: 'Draft Post',
        content: 'Content',
        slug: 'draft-post',
        status: 'DRAFT',
      })

      const response = await fetch('http://localhost:3000/api/posts')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.posts).toHaveLength(1)
      expect(data.data.posts[0].title).toBe('Published Post')
    })

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await createTestPost(testUser.id, {
          title: `Post ${i}`,
          content: 'Content',
          slug: `post-${i}`,
          status: 'PUBLISHED',
        })
      }

      const response = await fetch('http://localhost:3000/api/posts?page=1&limit=10')
      const data = await response.json()

      expect(data.data.posts).toHaveLength(10)
      expect(data.data.pagination.total).toBe(15)
      expect(data.data.pagination.pages).toBe(2)
    })

    it('should filter by tag', async () => {
      const tag = await prisma.tag.create({
        data: { name: 'JavaScript', slug: 'javascript' },
      })
      
      await createTestPost(testUser.id, {
        title: 'JS Post',
        content: 'Content',
        slug: 'js-post',
        status: 'PUBLISHED',
      })
      
      await prisma.post.update({
        where: { slug: 'js-post' },
        data: { tags: { connect: { id: tag.id } } },
      })

      const response = await fetch(`http://localhost:3000/api/posts?tag=${tag.slug}`)
      const data = await response.json()

      expect(data.data.posts).toHaveLength(1)
      expect(data.data.posts[0].slug).toBe('js-post')
    })
  })

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In real tests, you'd use actual session token
        },
        body: JSON.stringify({
          title: 'New Post',
          content: '# Hello World',
          excerpt: 'A new post',
          status: 'DRAFT',
          visibility: 'PUBLIC',
          tags: ['javascript', 'nextjs'],
        }),
      })

      const data = await response.json()
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.post.title).toBe('New Post')
      expect(data.data.post.slug).toBeTruthy()
    })

    it('should reject unauthorized post creation', async () => {
      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthorized',
          content: 'Content',
        }),
      })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/posts/[slug]', () => {
    it('should return a post by slug', async () => {
      await createTestPost(testUser.id, {
        title: 'Test Post',
        content: 'Content',
        slug: 'test-post-slug',
        status: 'PUBLISHED',
      })

      const response = await fetch('http://localhost:3000/api/posts/test-post-slug')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.post.slug).toBe('test-post-slug')
    })

    it('should return 404 for non-existent post', async () => {
      const response = await fetch('http://localhost:3000/api/posts/non-existent')
      expect(response.status).toBe(404)
    })
  })
})
