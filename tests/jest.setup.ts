import { jest } from '@jest/globals'

const requiredEnv = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'TEST_USER_PASSWORD', 'TEST_ADMIN_PASSWORD']

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`${key} is required for tests`) 
  }
}

// Set test environment variables
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// Mock NextAuth for tests
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        role: 'USER',
      },
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Set longer timeout for database operations
jest.setTimeout(30000)
