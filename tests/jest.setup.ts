import { jest } from '@jest/globals'

// Set test environment variables
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/personal_platform_test'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

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
