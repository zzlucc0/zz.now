# Testing Documentation

## Overview

This directory contains comprehensive tests for the personal platform, covering:

- **API Tests**: All REST API endpoints
- **Integration Tests**: End-to-end user flows
- **Unit Tests**: Validation schemas and helper functions

## Test Structure

```
tests/
├── api/                  # API endpoint tests
│   ├── auth.test.ts      # Registration, login
│   ├── posts.test.ts     # Post CRUD operations
│   ├── comments.test.ts  # Comment system
│   ├── reactions.test.ts # Reaction system
│   ├── emojis.test.ts    # Custom emoji system
│   └── admin.test.ts     # Admin moderation
├── integration/          # E2E tests
│   └── e2e.test.ts       # Complete user workflows
├── unit/                 # Unit tests
│   ├── validation.test.ts # Schema validation
│   └── helpers.test.ts   # Utility functions
├── setup.ts              # Test database setup
└── jest.setup.ts         # Jest configuration

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test File
```bash
npx jest tests/api/posts.test.ts
```

## Test Database

Tests use a separate test database to avoid affecting development data:

- **Database**: `personal_platform_test`
- **Setup**: Automatically creates and tears down test data
- **Isolation**: Each test suite cleans up after itself

### Setup Test Database

```bash
# Create test database
docker exec -i personal-platform-postgres psql -U postgres -c "CREATE DATABASE personal_platform_test;"

# Run migrations
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/personal_platform_test" npx prisma migrate deploy
```

## Test Coverage Goals

- **API Routes**: 100% coverage
- **Authentication**: All flows tested
- **CRUD Operations**: Create, Read, Update, Delete
- **Permissions**: Authorization checks
- **Validation**: All input schemas

## Writing New Tests

### Example: New API Endpoint Test

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { setupTestDatabase, teardownTestDatabase, createTestUser } from '../setup'

describe('New Feature API', () => {
  let testUser: any

  beforeAll(async () => {
    await setupTestDatabase()
    testUser = await createTestUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
    })
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  it('should do something', async () => {
    const response = await fetch('http://localhost:3000/api/feature')
    expect(response.status).toBe(200)
  })
})
```

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    docker-compose up -d postgres
    npm run test
```

## Troubleshooting

### Tests Failing Due to Database Connection

Ensure Docker containers are running:
```bash
docker-compose up -d
```

### Jest Timeout Errors

Increase timeout in test files:
```typescript
jest.setTimeout(30000) // 30 seconds
```

### Module Resolution Issues

Check `jest.config.js` for correct `moduleNameMapper`:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

## Test Coverage Report

After running `npm run test:coverage`, view the report:

```bash
open coverage/lcov-report/index.html
```

Target coverage: **70%** for all metrics (branches, functions, lines, statements)
