# Personal Platform

A self-hosted personal website and community platform built with Next.js, TypeScript, PostgreSQL, and MinIO.

## Features

- 🔐 **Authentication**: Secure user registration and login with NextAuth and Argon2
- 📝 **Blog Posts**: Create, edit, and publish blog posts with markdown support
- 💬 **Comments**: Nested comment threads on posts
- ❤️ **Reactions**: Like, love, laugh, and custom emoji reactions
- 🎨 **Custom Emojis**: Upload and use custom emoji reactions
- 👤 **User Profiles**: Customizable user profiles with avatars
- 🏷️ **Tags**: Organize posts with tags
- 🔍 **Audit Logging**: Track all user actions for security
- 📦 **S3 Storage**: MinIO for image and file storage
- 🎭 **RBAC**: Role-based access control (User, Moderator, Admin)

## Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Authentication**: NextAuth v5
- **Storage**: MinIO (S3-compatible)
- **Validation**: Zod
- **Password Hashing**: Argon2

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## Local Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start Docker services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- MinIO on ports 9000 (API) and 9001 (Console)

### 3. Set up environment variables

The `.env` file is already configured for local development.
Update `NEXTAUTH_SECRET` for production use.

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the development server

```bash
npm run dev
```

The application will be available at http://localhost:3000

### 6. Access MinIO Console

Visit http://localhost:9001 and login with:
- Username: `minioadmin`
- Password: `minioadmin`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations

## Project Structure

```
personal-platform/
├── app/
│   ├── api/           # API routes
│   ├── (auth)/        # Auth pages (login, register)
│   ├── posts/         # Post pages
│   └── page.tsx       # Home page
├── lib/
│   ├── auth/          # Authentication logic
│   ├── db/            # Database client
│   ├── storage/       # MinIO storage
│   ├── utils/         # Utility functions
│   └── validations/   # Zod schemas
├── prisma/
│   └── schema.prisma  # Database schema
├── docker-compose.yml # Local development services
└── .env               # Environment variables
```

## Database Schema

The platform includes the following models:
- **User**: User accounts with authentication
- **Account**: OAuth provider accounts
- **Session**: User sessions
- **Post**: Blog posts with tags and status
- **Comment**: Nested comments on posts
- **Reaction**: User reactions to posts/comments
- **Tag**: Post categorization
- **CustomEmoji**: User-uploaded custom emojis
- **AuditLog**: Security and audit trail

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Posts
- `GET /api/posts` - List posts (paginated)
- `POST /api/posts` - Create post (auth required)
- `GET /api/posts/[slug]` - Get post by slug
- `PATCH /api/posts/[slug]` - Update post (auth required)
- `DELETE /api/posts/[slug]` - Delete post (auth required)

### Comments
- `POST /api/comments` - Create comment (auth required)

### Reactions
- `POST /api/reactions` - Add/remove reaction (auth required)

## Production Deployment

### Using Docker Compose

1. Update `.env` with production values
2. Build and start services

### Environment Variables for Production

Update these in `.env`:

```
DATABASE_URL="postgresql://user:password@postgres:5432/personal_platform"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-a-strong-secret-key"
MINIO_ENDPOINT="minio"
MINIO_USE_SSL="true"
```

## Security Features

- Password hashing with Argon2id
- JWT-based sessions
- CSRF protection via NextAuth
- Role-based access control
- Comprehensive audit logging
- SQL injection prevention via Prisma
- Input validation with Zod

## License

MIT License
