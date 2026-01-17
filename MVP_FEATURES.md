# MVP Scope & Feature Matrix

## Current Implementation Status

✅ = Fully Implemented  
🟡 = Partially Implemented  
⚪ = Not Implemented (Future)

---

## A) MVP Scope vs Future Features

### ✅ MVP Features (COMPLETED)

#### Authentication & User Management
- ✅ Email + Password registration
- ✅ Login/Logout with NextAuth v5
- ✅ Password hashing with Argon2id
- ✅ User profiles (display name, bio, avatar)
- ✅ Role-based access control (USER, MODERATOR, ADMIN)
- ✅ Auto-promote ADMIN via ADMIN_EMAILS env var
- ✅ Public user profile pages (`/u/[username]`)
- ✅ Profile editing (`/settings/profile`)

#### Blog Posts System
- ✅ Create posts with Markdown content
- ✅ WYSIWYG editor with live preview
- ✅ Image uploads via MinIO presigned URLs
- ✅ Video embeds (YouTube/Vimeo links)
- ✅ Post tags/categories
- ✅ Post status (DRAFT, PUBLISHED, ARCHIVED)
- ✅ Post visibility (PUBLIC, UNLISTED, PRIVATE)
- ✅ Edit/delete own posts
- ✅ Post detail pages with full content
- ✅ Post listing with pagination
- ✅ Filter posts by tag/author

#### Comments System
- ✅ Nested comment threads (unlimited depth)
- ✅ Markdown support in comments
- ✅ Edit/delete own comments
- ✅ Comment on posts
- ✅ Reply to comments
- ✅ Comment count display

#### Reactions System
- ✅ React to posts and comments
- ✅ Built-in reactions (Like, Love, Laugh, Thinking)
- ✅ Custom emoji reactions
- ✅ Toggle reactions (add/remove)
- ✅ Reaction counts display

#### Custom Emojis/Stickers
- ✅ User-uploaded custom emojis
- ✅ Emoji management page (`/settings/emojis`)
- ✅ Upload emoji images/GIFs
- ✅ Emoji keywords/search
- ✅ Use emojis in posts/comments (`:emoji_id:` syntax)
- ✅ Emoji rendering in Markdown

#### Media Storage & Uploads
- ✅ MinIO S3-compatible storage
- ✅ Presigned URL upload flow
- ✅ Media types: POST_IMAGE, AVATAR, EMOJI
- ✅ MIME type validation (images only)
- ✅ File size limits (5-10MB)
- ✅ Media proxy route (`/api/media/[...key]`)
- ✅ Image uploads in post editor

#### Admin & Moderation
- ✅ Admin dashboard (`/admin/moderation`)
- ✅ Delete any post (USER can only delete own)
- ✅ Delete any comment (USER can only delete own)
- ✅ Audit logging for all moderation actions
- ✅ Audit log viewer (`/admin/audit`)
- ✅ Admin-only routes protected

#### Security
- ✅ Authorization checks on all API routes
- ✅ Ownership validation (can't edit others' content)
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (sanitize-html in Markdown)
- ✅ CSRF protection (NextAuth)
- ✅ Secure password hashing (Argon2id)
- ✅ File upload constraints (MIME + size)
- ✅ Comprehensive audit trail

#### Infrastructure
- ✅ Docker Compose for development
- ✅ Docker Compose for production
- ✅ PostgreSQL 16 database
- ✅ Prisma ORM with migrations
- ✅ MinIO object storage
- ✅ Next.js standalone build
- ✅ Health check endpoints
- ✅ Backup scripts (postgres, minio)
- ✅ Restore scripts

#### Documentation
- ✅ README with setup guide
- ✅ DEVELOPMENT.md with architecture details
- ✅ PRODUCTION.md with deployment guide
- ✅ TESTING.md with security checklist
- ✅ IMPLEMENTATION.md with feature list
- ✅ DEPLOYMENT_RUNBOOK.md (comprehensive)
- ✅ Backup/restore procedures

#### UI/UX
- ✅ Responsive design (mobile-friendly)
- ✅ Dark mode support
- ✅ Navigation with auth state detection
- ✅ Dashboard for users
- ✅ Post editor with Markdown preview
- ✅ Comment threads with nesting
- ✅ Reaction buttons
- ✅ Tag filtering
- ✅ Loading states and error handling

#### Tools & Projects
- ✅ Tools landing page (`/tools`)
- ✅ Extensible tool architecture
- ✅ Tool detail template (`/tools/[toolSlug]`)
- ✅ Example tools (calculator, example-tool)
- ✅ Projects landing page (`/projects`)
- ✅ Project detail template (`/projects/[slug]`)

---

### 🟡 Partially Implemented Features

#### Media Management
- ✅ Upload images
- ✅ Video embeds (links)
- ⚪ View all uploaded media
- ⚪ Delete unused media
- ⚪ Orphaned media cleanup
- ⚪ Uploaded video files (future)

#### Search & Discovery
- ✅ Filter posts by tag
- ✅ Filter posts by author
- ⚪ Full-text search (posts/comments)
- ⚪ Tag search/autocomplete (API exists, UI basic)
- ⚪ User search

#### Post Features
- ✅ Basic tags
- ⚪ Featured posts
- ⚪ Post views counter
- ⚪ Post sharing (social media)
- ⚪ Related posts
- ⚪ Table of contents for long posts

---

### ⚪ Future Features (Not in MVP)

#### Email System
- ⚪ Email verification (model exists, no flow)
- ⚪ Password reset via email
- ⚪ Email notifications (new comments, mentions)
- ⚪ Newsletter/email digest

#### Social Features
- ⚪ Follow/unfollow users
- ⚪ User mentions (@username)
- ⚪ Activity feed
- ⚪ Notifications system
- ⚪ Bookmarks/favorites

#### Advanced Moderation
- ⚪ Report content (spam, abuse)
- ⚪ Moderator queue
- ⚪ Auto-moderation rules
- ⚪ User bans/suspensions
- ⚪ Content flags/warnings

#### Performance & Scale
- ⚪ Redis caching
- ⚪ Rate limiting (API endpoints)
- ⚪ CDN integration
- ⚪ Image optimization/resizing
- ⚪ Lazy loading
- ⚪ Infinite scroll

#### Content Features
- ⚪ Post series/collections
- ⚪ Scheduled publishing
- ⚪ Post templates
- ⚪ Co-authoring
- ⚪ Post versions/history

#### Analytics
- ⚪ View analytics
- ⚪ User engagement metrics
- ⚪ Popular posts
- ⚪ Traffic sources

#### API & Integrations
- ⚪ Public API for external apps
- ⚪ OAuth for third-party apps
- ⚪ Webhooks
- ⚪ RSS feed
- ⚪ Sitemap.xml generation

#### Mobile
- ⚪ Progressive Web App (PWA)
- ⚪ Native mobile apps
- ⚪ Push notifications

---

## B) Permission Matrix

### Role Definitions

| Role | Description | Count |
|------|-------------|-------|
| **USER** | Standard registered user | Unlimited |
| **MODERATOR** | Trusted user with moderation powers | Manual assign |
| **ADMIN** | Platform owner with full control | Auto via ADMIN_EMAILS |

---

### Permission Matrix

| Action | USER | MODERATOR | ADMIN | Notes |
|--------|------|-----------|-------|-------|
| **Authentication** |
| Sign up | ✅ | ✅ | ✅ | Public |
| Login/Logout | ✅ | ✅ | ✅ | |
| View own profile | ✅ | ✅ | ✅ | |
| Edit own profile | ✅ | ✅ | ✅ | Display name, bio, avatar |
| View public profiles | ✅ | ✅ | ✅ | Anyone (even guest) |
| **Posts** |
| View published posts | ✅ | ✅ | ✅ | Public |
| Create post | ✅ | ✅ | ✅ | |
| Edit own post | ✅ | ✅ | ✅ | Anytime |
| Delete own post | ✅ | ✅ | ✅ | |
| Edit others' post | ❌ | ❌ | 🟡 | Admin can (optional) |
| Delete others' post | ❌ | ✅ | ✅ | Moderation |
| Publish/unpublish own | ✅ | ✅ | ✅ | Status change |
| View draft posts | Own only | Own only | All | |
| **Comments** |
| View comments | ✅ | ✅ | ✅ | Public |
| Create comment | ✅ | ✅ | ✅ | |
| Edit own comment | ✅ | ✅ | ✅ | Within time limit |
| Delete own comment | ✅ | ✅ | ✅ | |
| Edit others' comment | ❌ | ❌ | ❌ | Not implemented |
| Delete others' comment | ❌ | ✅ | ✅ | Moderation |
| **Reactions** |
| React to post | ✅ | ✅ | ✅ | |
| React to comment | ✅ | ✅ | ✅ | |
| Remove own reaction | ✅ | ✅ | ✅ | Toggle |
| **Custom Emojis** |
| View own emojis | ✅ | ✅ | ✅ | |
| Upload emoji | ✅ | ✅ | ✅ | Size limit: 5MB |
| Edit own emoji | ✅ | ✅ | ✅ | Name, keywords |
| Delete own emoji | ✅ | ✅ | ✅ | |
| View others' emojis | 🟡 | 🟡 | ✅ | In posts/comments only |
| Delete others' emoji | ❌ | ❌ | 🟡 | Admin can (optional) |
| **Media** |
| Upload post image | ✅ | ✅ | ✅ | Max 10MB |
| Upload avatar | ✅ | ✅ | ✅ | Max 5MB |
| Upload emoji | ✅ | ✅ | ✅ | Max 5MB |
| View media | ✅ | ✅ | ✅ | Public via proxy |
| **Tags** |
| View tags | ✅ | ✅ | ✅ | Public |
| Create tag | ✅ | ✅ | ✅ | Anyone can create |
| Edit tag | ❌ | ❌ | ✅ | Admin only |
| Delete tag | ❌ | ❌ | ✅ | Admin only |
| **Admin Panel** |
| Access admin dashboard | ❌ | ❌ | ✅ | Admin only |
| View audit logs | ❌ | ❌ | ✅ | Admin only |
| Moderation dashboard | ❌ | ✅ | ✅ | Mod+ |
| Delete any content | ❌ | ✅ | ✅ | Logged in audit |
| **API Access** |
| Public endpoints | ✅ | ✅ | ✅ | No auth needed |
| Authenticated endpoints | ✅ | ✅ | ✅ | Session required |
| Admin endpoints | ❌ | ❌ | ✅ | Role check |

---

### Authorization Enforcement Points

#### API Layer (Primary)
All authorization checks happen in API route handlers:
- `lib/auth/authorization.ts` helper functions
- `canModifyPost()`, `canModifyComment()`, `isOwnerOrAdmin()`
- Session middleware via NextAuth

#### Database Layer (Secondary)
- Prisma queries filtered by `authorId`
- Soft deletes preserve data integrity
- Foreign key constraints prevent orphans

#### UI Layer (UX Only)
- Hide edit/delete buttons for non-owners
- Disable admin links for non-admins
- **NOT SECURITY**: Always check API

---

### Example Authorization Flow

**Scenario**: User A tries to delete User B's post

1. **UI**: Button hidden if not owner/admin ✅
2. **API Request**: `DELETE /api/posts/[id]`
3. **Session Check**: Is user authenticated? ✅
4. **Authorization Check**:
   ```typescript
   const post = await prisma.post.findUnique({ where: { id } })
   if (!canModifyPost(session.user, post)) {
     return 403 Forbidden
   }
   ```
5. **Result**:
   - User A (not owner, not admin): ❌ 403 Forbidden
   - Admin: ✅ Delete succeeds + audit log created
   - User B (owner): ✅ Delete succeeds

---

### Security Rules Summary

#### Golden Rules
1. **Never trust the client** - Always validate on server
2. **Check ownership** - Users can only modify their own content
3. **Admin exception** - Admin can delete (not edit) any content
4. **Log everything** - Audit trail for all admin actions
5. **Fail closed** - Default to deny if unsure

#### Validation Layers
1. **Input validation**: Zod schemas
2. **Authentication**: NextAuth session
3. **Authorization**: Role + ownership checks
4. **Database**: Prisma type safety
5. **Output**: Sanitize HTML in Markdown

#### Sensitive Operations
- Post/comment deletion by admin → Audit logged
- Password changes → Hash with Argon2id
- File uploads → MIME + size validation
- Admin role assignment → Via ADMIN_EMAILS only

---

## C) Data Flow Examples

### Create Post Flow
```
User → POST /api/posts
  ↓ Session check (authenticated?)
  ↓ Validate input (Zod schema)
  ↓ Upload images (presigned URLs)
  ↓ Create post in DB (authorId = session.user.id)
  ↓ Return post with slug
  ↓ Redirect to /posts/[slug]
```

### Delete Others' Post (Admin)
```
Admin → DELETE /api/posts/[id]
  ↓ Session check (authenticated?)
  ↓ Fetch post from DB
  ↓ Authorization check (isOwnerOrAdmin?)
  ↓ If admin: Create audit log
  ↓ Delete post from DB
  ↓ Return success
```

### Upload Emoji Flow
```
User → POST /api/media/presign (purpose: EMOJI)
  ↓ Session check
  ↓ Validate MIME type (image/png, gif, etc.)
  ↓ Validate size (max 5MB)
  ↓ Generate presigned URL from MinIO
  ↓ Return uploadUrl + objectKey
  
User → PUT to presigned URL (directly to MinIO)
  ↓ Upload file bytes
  
User → POST /api/media/confirm
  ↓ Create Emoji record in DB (ownerId = session.user.id)
  ↓ Return emoji ID and public URL
```

---

## D) Feature Priority Roadmap

### Phase 1: MVP (✅ COMPLETE)
- Core authentication
- Post creation/editing
- Comments and reactions
- Custom emojis
- Admin moderation
- Docker deployment

### Phase 2: Polish (Next)
- Email verification
- Password reset
- Full-text search
- Rate limiting
- Media management UI
- RSS feed

### Phase 3: Social (Future)
- Follow users
- Notifications
- Activity feed
- User mentions
- Bookmarks

### Phase 4: Scale (Future)
- Redis caching
- CDN integration
- Image optimization
- Advanced analytics
- Public API

---

## Summary

**MVP Status**: ✅ **PRODUCTION READY**

The platform has all core features implemented with proper security, authorization, and infrastructure. You can deploy to production today and add Phase 2+ features incrementally based on user feedback.

**Next Steps**:
1. Deploy to production server
2. Configure backups and monitoring
3. Test with real users
4. Gather feedback
5. Prioritize Phase 2 features
