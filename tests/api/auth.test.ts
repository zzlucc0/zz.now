import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { setupTestDatabase, teardownTestDatabase, createTestUser, prisma } from '../setup'

describe('Authentication API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'SecurePass123!',
        }),
      })

      const data = await response.json()
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.user).toHaveProperty('id')
      expect(data.data.user.username).toBe('testuser')
      expect(data.data.user.email).toBe('test@example.com')
    })

    it('should reject registration with short username', async () => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'ab',
          email: 'test2@example.com',
          password: 'SecurePass123!',
        }),
      })

      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.fields).toHaveProperty('username')
    })

    it('should reject registration with weak password', async () => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser2',
          email: 'test3@example.com',
          password: '123',
        }),
      })

      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.fields).toHaveProperty('password')
    })

    it('should reject duplicate username', async () => {
      await createTestUser({
        username: 'duplicate',
        email: 'dup1@example.com',
        password: 'Password123!',
      })

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'duplicate',
          email: 'dup2@example.com',
          password: 'Password123!',
        }),
      })

      const data = await response.json()
      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
    })

    it('should reject duplicate email', async () => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'another',
          email: 'dup1@example.com', // Already used
          password: 'Password123!',
        }),
      })

      const data = await response.json()
      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
    })
  })
})
