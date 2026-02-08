import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { setupTestDatabase, teardownTestDatabase, createTestUser, prisma } from '../setup'

describe('Emojis API', () => {
  let adminUser: any

  beforeAll(async () => {
    await setupTestDatabase()
    adminUser = await createTestUser({
      username: 'emojiadmin',
      email: 'emojiadmin@example.com',
      password: process.env.TEST_ADMIN_PASSWORD,
      role: 'ADMIN',
    })
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  describe('GET /api/emojis', () => {
    it('should return list of emojis', async () => {
      await prisma.customEmoji.create({
        data: {
          name: 'test_emoji',
          objectKey: 'emojis/test.png',
          ownerId: adminUser.id,
        },
      })

      const response = await fetch('http://localhost:3000/api/emojis')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.emojis.length).toBeGreaterThan(0)
    })
  })

  describe('POST /api/emojis', () => {
    it('should create a new emoji (admin only)', async () => {
      const response = await fetch('http://localhost:3000/api/emojis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'new_emoji',
          imageUrl: 'https://example.com/new-emoji.png',
        }),
      })

      const data = await response.json()
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.emoji.name).toBe('new_emoji')
    })

    it('should reject duplicate emoji names', async () => {
      await prisma.customEmoji.create({
        data: {
          name: 'duplicate',
          objectKey: 'emojis/dup1.png',
          ownerId: adminUser.id,
        },
      })

      const response = await fetch('http://localhost:3000/api/emojis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'duplicate',
          imageUrl: 'https://example.com/emoji2.png',
        }),
      })

      expect(response.status).toBe(409)
    })
  })

  describe('GET /api/emojis/search', () => {
    it('should search emojis by name', async () => {
      await prisma.customEmoji.create({
        data: {
          name: 'smile',
          objectKey: 'emojis/smile.png',
          ownerId: adminUser.id,
        },
      })

      const response = await fetch('http://localhost:3000/api/emojis/search?q=smi')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.emojis.length).toBeGreaterThan(0)
      expect(data.data.emojis[0].name).toContain('smile')
    })
  })
})
