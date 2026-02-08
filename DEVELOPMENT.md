# Development Guide

This guide provides detailed information for developers working on the Personal Platform project.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run setup script (starts Docker, runs migrations)
./setup.sh

# 3. Start development server
npm run dev
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 App Router with React Server Components
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5 (Auth.js)
- **Storage**: MinIO (S3-compatible object storage)
- **Validation**: Zod for runtime type checking

### Directory Structure

```
app/
├── api/              # API route handlers
│   ├── auth/         # Authentication endpoints
│   ├── posts/        # Post CRUD operations
│   ├── comments/     # Comment operations
│   └── reactions/    # Reaction operations
├── layout.tsx        # Root layout
└── page.tsx          # Home page

lib/
├── auth/             # Authentication utilities
│   ├── config.ts     # NextAuth configuration
│   └── password.ts   # Password hashing utilities
├── db/
│   └── prisma.ts     # Prisma client singleton
├── storage/
│   └── minio.ts      # MinIO/S3 storage utilities
├── utils/
│   ├── audit.ts      # Audit logging
│   └── helpers.ts    # Helper functions
└── validations/
    └── schemas.ts    # Zod validation schemas

prisma/
└── schema.prisma     # Database schema definition
```

## Development Workflow

### 1. Database Changes

When modifying the database schema:

```bash
# Edit prisma/schema.prisma

# Create and apply migration
npx prisma migrate dev --name description_of_change

# Generate Prisma client
npx prisma generate
```

### 2. Database Management

```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### 3. API Development

API routes follow Next.js App Router conventions:
- Located in `app/api/`
- Use Route Handlers (GET, POST, PATCH, DELETE)
- Validate input with Zod schemas from `lib/validations/schemas.ts`

Example API route structure:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  // 1. Check authentication
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Validate input
  const body = await request.json()
  const validated = schema.parse(body)

  // 3. Database operation
  const result = await prisma.model.create({ data: validated })

  // 4. Return response
  return NextResponse.json({ result }, { status: 201 })
}
```

### 4. Adding New Features

#### Adding a new API endpoint:

1. Create route file: `app/api/[feature]/route.ts`
2. Add validation schema: `lib/validations/schemas.ts`
3. Implement route handlers (GET, POST, etc.)
4. Add audit logging if needed
5. Test the endpoint

#### Adding a new database model:

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_model_name`
3. Update TypeScript types as needed
4. Create corresponding API routes

## Authentication

The platform uses NextAuth v5 with JWT sessions.

### Protected Routes

```typescript
import { auth } from '@/lib/auth/config'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... protected logic
}
```

### Role-Based Access Control

```typescript
const session = await auth()
if (session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

## Testing

### Manual Testing with curl

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "${TEST_USER_PASSWORD}",
    "displayName": "Test User"
  }'

# Get posts
curl http://localhost:3000/api/posts
```

## Docker Services

### PostgreSQL
- Port: 5432
- Username: postgres
- Password: ${POSTGRES_PASSWORD}
- Database: personal_platform

```bash
# Connect to PostgreSQL
docker exec -it personal-platform-postgres psql -U postgres -d personal_platform

# View logs
docker-compose logs postgres
```

### MinIO
- API Port: 9000
- Console Port: 9001
- Access Key: ${MINIO_ROOT_USER}
- Secret Key: ${MINIO_ROOT_PASSWORD}

```bash
# View logs
docker-compose logs minio

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## Common Tasks

### Reset Everything

```bash
# Stop services and remove volumes
docker-compose down -v

# Start services
docker-compose up -d

# Wait for services to be ready
sleep 5

# Reset database
npx prisma migrate reset --force

# Start dev server
npm run dev
```

### Debugging

1. **Database queries**: Set `log: ['query']` in `lib/db/prisma.ts`
2. **API errors**: Check browser Network tab and terminal output
3. **Docker issues**: Run `docker-compose logs` to view service logs

## Code Style

- Use TypeScript strict mode
- Follow ESLint rules: `npm run lint`
- Use Prettier for formatting (configure in your editor)
- Use async/await over promises
- Handle errors appropriately with try/catch

## Security Considerations

- Always validate user input with Zod schemas
- Use parameterized queries (Prisma handles this)
- Never commit `.env` files
- Hash passwords with Argon2
- Implement rate limiting for production
- Log important actions with audit logs
- Check user permissions before operations

## Performance Tips

- Use Prisma's `select` and `include` to limit data
- Implement pagination for list endpoints
- Use database indexes for frequently queried fields
- Cache static content
- Optimize images before uploading to MinIO

## Troubleshooting

### Port already in use
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Prisma client issues
```bash
npx prisma generate
```

### Docker services won't start
```bash
docker-compose down
docker-compose up -d
```

### Migration conflicts
```bash
npx prisma migrate reset
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://authjs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev)
