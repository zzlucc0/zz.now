# Personal Platform

A modern, self-hosted personal website and community platform built with Next.js 15, featuring a clean reading-first design with shadcn/ui components.

## ✨ Features

- 🔐 **Authentication**: Secure user registration and login with NextAuth v5 and Argon2
- 📝 **Blog Posts**: Create, edit, and publish blog posts with markdown support
- 💬 **Comments**: Nested comment threads on posts
- ❤️ **Reactions**: Like, love, laugh, and custom emoji reactions
- 🎨 **Custom Emojis**: Upload and use custom emoji reactions
- 👤 **User Profiles**: Customizable user profiles with avatars
- 🏷️ **Tags**: Organize posts with tags
- 🔍 **Audit Logging**: Track all user actions for security
- 📦 **S3 Storage**: MinIO for image and file storage
- 🎭 **RBAC**: Role-based access control (User, Moderator, Admin)
- 🌓 **Dark Mode**: Elegant light and dark themes with next-themes
- 🎯 **3-Column Layout**: Sidebar navigation, main feed, and context panel

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router with RSC)
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS custom properties
- **Icons**: Lucide React
- **Theme**: next-themes with system preference support
- **Typography**: Geist Sans & Geist Mono

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Authentication**: NextAuth v5
- **Storage**: MinIO (S3-compatible)
- **Validation**: Zod
- **Password Hashing**: Argon2

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## 🚀 Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/zzlucc0/zz.now.git
cd zz.now
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start Docker services

```bash
docker compose up -d
```

This will start:
- PostgreSQL on port 5432
- MinIO on ports 9000 (API) and 9001 (Console)

### 4. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the values. Keep this file local-only (it's gitignored). At minimum you need:

- Database connection details (`DATABASE_URL`)
- `NEXTAUTH_SECRET` (generate a unique value)
- Local admin bootstrap secrets (`ADMIN_BOOTSTRAP_USERNAME`, `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD` — used only when seeding an admin account)

### 5. Run database migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Seed the database (optional)

```bash
npx prisma db seed
```

To create an initial admin account for local testing, set the `ADMIN_BOOTSTRAP_*` variables in your `.env` and run:

```bash
npx tsx scripts/create-admin.ts
```

The script reads credentials from your environment and never prints the raw password. Remove or rotate the bootstrap values after the admin account is created.

### 7. Start the development server

```bash
npm run dev
```

The application will be available at http://localhost:3000

### 8. Access MinIO Console

Visit http://localhost:9001 and login with:
- Username: `${MINIO_ROOT_USER}`
- Password: `${MINIO_ROOT_PASSWORD}`

## 📜 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma db seed` - Seed the database with sample data

## 🎨 Design System

The platform uses a custom design system built with shadcn/ui:

### Color Palette
- **Day Mode**: Warm paper background (248 246 242) with green-gray accents (54 92 82)
- **Night Mode**: Dark cozy background (18 18 18) with sage accents (122 162 144)
- **Border Radius**: 14px globally for soft, modern feel
- **Focus**: Borders over shadows for clarity

### Layout
- **3-Column Grid**: 240px sidebar | 720px main feed | 320px context panel
- **Responsive**: Collapses to single column on mobile (<1024px)
- **Reading-First**: Optimized for long-form content with 1.7 line height

## 📁 Project Structure

```
personal-platform/
├── app/
│   ├── api/              # API routes
│   ├── (auth)/           # Auth pages (login, register)
│   ├── posts/            # Post pages
│   ├── dashboard/        # User dashboard
│   ├── editor/           # Post editor
│   ├── settings/         # User settings
│   ├── admin/            # Admin panel
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── Sidebar.tsx       # Main navigation
│   ├── ThemeToggle.tsx   # Dark mode toggle
│   └── ...               # Feature components
├── lib/
│   ├── auth/             # Authentication logic
│   ├── db/               # Database client
│   ├── storage/          # MinIO storage
│   ├── mock/             # Mock data for UI development
│   ├── utils/            # Utility functions
│   └── validations/      # Zod schemas
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.ts           # Database seeding
├── docker-compose.yml    # Local development services
├── components.json       # shadcn/ui configuration
└── .env                  # Environment variables
```

## 🗄️ Database Schema

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
- **PostMedia**: Media attachments for posts

## 🔌 API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Posts
- `GET /api/posts` - List posts (paginated, filterable)
- `POST /api/posts` - Create post (auth required)
- `GET /api/posts/[slug]` - Get post by slug
- `PATCH /api/posts/[slug]` - Update post (auth required)
- `DELETE /api/posts/[slug]` - Delete post (auth required)

### Comments
- `GET /api/comments` - List comments (paginated)
- `POST /api/comments` - Create comment (auth required)
- `PATCH /api/comments/[id]` - Update comment (auth required)
- `DELETE /api/comments/[id]` - Delete comment (auth required)

### Reactions
- `POST /api/reactions` - Add/remove reaction (auth required)

### Media
- `POST /api/media/presign` - Get presigned upload URL
- `POST /api/media/confirm` - Confirm upload completion
- `GET /api/media/[...key]` - Get media file

### Admin
- `DELETE /api/admin/posts/[id]` - Delete any post (admin only)
- `DELETE /api/admin/comments/[id]` - Delete any comment (admin only)
- `GET /api/admin/audit` - View audit logs (admin only)

## 🚢 Production Deployment

### Using Docker Compose

1. Update `.env` with production values
2. Build and start services:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

See [PRODUCTION.md](./PRODUCTION.md) for detailed deployment instructions.

### Environment Variables for Production

Update these in `.env`:

```
DATABASE_URL="postgresql://user:password@postgres:5432/personal_platform"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-a-strong-secret-key"
MINIO_ENDPOINT="minio"
MINIO_USE_SSL="true"
```

## 🔒 Security Features

- Password hashing with Argon2id
- JWT-based sessions with secure cookies
- CSRF protection via NextAuth
- Role-based access control (RBAC)
- Comprehensive audit logging
- SQL injection prevention via Prisma ORM
- Input validation with Zod schemas
- XSS protection with content sanitization
- Secure file uploads with MinIO

## 📚 Documentation

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide and conventions
- [PRODUCTION.md](./PRODUCTION.md) - Production deployment guide
- [TESTING.md](./TESTING.md) - Testing guide
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Implementation details

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [MinIO](https://min.io/) - Object storage
- [Radix UI](https://www.radix-ui.com/) - Headless UI primitives
- [Lucide](https://lucide.dev/) - Icon library

---

Built with ❤️ using modern web technologies
