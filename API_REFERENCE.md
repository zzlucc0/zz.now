# API Documentation

Complete API reference for the Personal Platform.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`

## Authentication

Most endpoints require authentication via NextAuth session cookies.

### Headers

```
Content-Type: application/json
Cookie: next-auth.session-token=<token>
```

### Response Format

All API responses follow this structure:

```typescript
{
  success: boolean
  data: object | null
  error: {
    code: string
    message: string
    details?: any
  } | null
}
```

---

## Endpoints

### Authentication

#### POST `/api/auth/register`

Register a new user account.

**Auth**: Not required

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe",
  "displayName": "John Doe"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "username": "johndoe",
      "displayName": "John Doe",
      "role": "USER"
    }
  },
  "error": null
}
```

**Errors**:
- `400` - Validation error (email/username/password invalid)
- `409` - User already exists

---

#### POST `/api/auth/signin`

Login handled by NextAuth. Use NextAuth client methods.

#### POST `/api/auth/signout`

Logout handled by NextAuth.

---

### User Profile

#### GET `/api/me`

Get current user's profile.

**Auth**: Required

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "username": "johndoe",
      "displayName": "John Doe",
      "bio": "Software developer",
      "avatarUrl": "https://example.com/avatar.jpg",
      "role": "USER",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  },
  "error": null
}
```

---

#### PATCH `/api/me`

Update current user's profile.

**Auth**: Required

**Request**:
```json
{
  "displayName": "John Smith",
  "bio": "Full-stack developer",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": { /* updated user object */ }
  },
  "error": null
}
```

---

#### GET `/api/users/:id`

Get public user profile.

**Auth**: Not required

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "username": "johndoe",
      "displayName": "John Doe",
      "bio": "Software developer",
      "avatarUrl": "https://example.com/avatar.jpg",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  },
  "error": null
}
```

---

### Posts

#### GET `/api/posts`

List posts with pagination and filters.

**Auth**: Not required

**Query Parameters**:
- `cursor` - Pagination cursor (post ID)
- `limit` - Number of posts (default: 10, max: 50)
- `tag` - Filter by tag slug
- `authorId` - Filter by author
- `status` - Filter by status (DRAFT, PUBLISHED, ARCHIVED)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "clx...",
        "title": "My First Post",
        "slug": "my-first-post",
        "excerpt": "This is a great post",
        "content": "# Hello World\n\nThis is my content...",
        "status": "PUBLISHED",
        "visibility": "PUBLIC",
        "publishedAt": "2025-01-15T10:00:00.000Z",
        "author": {
          "id": "clx...",
          "username": "johndoe",
          "displayName": "John Doe",
          "avatarUrl": "..."
        },
        "tags": [
          { "id": "clx...", "name": "Technology", "slug": "technology" }
        ],
        "_count": {
          "comments": 5,
          "reactions": 12
        }
      }
    ],
    "nextCursor": "clx...",
    "hasMore": true
  },
  "error": null
}
```

---

#### POST `/api/posts`

Create a new post.

**Auth**: Required

**Request**:
```json
{
  "title": "My New Post",
  "slug": "my-new-post",
  "content": "# Hello\n\nMarkdown content here",
  "excerpt": "Short summary",
  "tags": ["technology", "coding"],
  "status": "PUBLISHED",
  "visibility": "PUBLIC"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "post": { /* post object */ }
  },
  "error": null
}
```

---

#### GET `/api/posts/:slug`

Get single post by slug.

**Auth**: Not required (public posts), Required (private/draft)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "clx...",
      "title": "My First Post",
      "slug": "my-first-post",
      "content": "...",
      "status": "PUBLISHED",
      "visibility": "PUBLIC",
      "publishedAt": "2025-01-15T10:00:00.000Z",
      "author": { /* author object */ },
      "tags": [ /* tags */ ],
      "media": [ /* media attachments */ ],
      "reactions": [ /* reactions */ ],
      "_count": {
        "comments": 5,
        "reactions": 12
      }
    }
  },
  "error": null
}
```

---

#### PATCH `/api/posts/:slug`

Update an existing post.

**Auth**: Required (owner or admin)

**Request**:
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["new-tag"],
  "status": "PUBLISHED"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "post": { /* updated post */ }
  },
  "error": null
}
```

**Errors**:
- `403` - Not authorized (not owner)
- `404` - Post not found

---

#### DELETE `/api/posts/:slug`

Delete a post.

**Auth**: Required (owner or admin)

**Response** (200):
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

**Note**: If deleted by admin, creates audit log entry.

---

### Comments

#### GET `/api/comments?postId=:postId`

Get comments for a post.

**Auth**: Not required

**Query Parameters**:
- `postId` - Post ID (required)
- `cursor` - Pagination cursor
- `limit` - Number of comments (default: 20)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "clx...",
        "content": "Great post!",
        "createdAt": "2025-01-15T12:00:00.000Z",
        "author": {
          "id": "clx...",
          "username": "janedoe",
          "displayName": "Jane Doe",
          "avatarUrl": "..."
        },
        "parentId": null,
        "replies": [ /* nested replies */ ],
        "_count": {
          "replies": 2,
          "reactions": 3
        }
      }
    ],
    "nextCursor": "clx...",
    "hasMore": false
  },
  "error": null
}
```

---

#### POST `/api/comments`

Create a comment or reply.

**Auth**: Required

**Request**:
```json
{
  "postId": "clx...",
  "content": "This is a great post!",
  "parentId": "clx..." // Optional, for replies
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "comment": { /* comment object */ }
  },
  "error": null
}
```

---

#### PATCH `/api/comments/:id`

Update a comment.

**Auth**: Required (owner or admin)

**Request**:
```json
{
  "content": "Updated comment text"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "comment": { /* updated comment */ }
  },
  "error": null
}
```

---

#### DELETE `/api/comments/:id`

Delete a comment.

**Auth**: Required (owner or admin)

**Response** (200):
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

---

### Reactions

#### POST `/api/reactions`

Toggle a reaction on a post or comment.

**Auth**: Required

**Request**:
```json
{
  "postId": "clx...", // Either postId or commentId
  "commentId": "clx...", // Optional
  "type": "LIKE" // LIKE, LOVE, LAUGH, THINKING, CUSTOM
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "reaction": {
      "id": "clx...",
      "type": "LIKE",
      "postId": "clx...",
      "userId": "clx..."
    },
    "action": "added" // or "removed"
  },
  "error": null
}
```

**Note**: If reaction exists, it's removed. If not, it's added.

---

### Tags

#### GET `/api/tags`

List all tags.

**Auth**: Not required

**Query Parameters**:
- `search` - Filter tags by name (optional)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": "clx...",
        "name": "Technology",
        "slug": "technology",
        "_count": {
          "posts": 15
        }
      }
    ]
  },
  "error": null
}
```

---

#### POST `/api/tags`

Create a new tag.

**Auth**: Required

**Request**:
```json
{
  "name": "New Tag",
  "slug": "new-tag"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "tag": {
      "id": "clx...",
      "name": "New Tag",
      "slug": "new-tag"
    }
  },
  "error": null
}
```

**Errors**:
- `409` - Tag with same name/slug already exists

---

### Media Upload

#### POST `/api/media/presign`

Get a presigned URL for file upload.

**Auth**: Required

**Request**:
```json
{
  "purpose": "POST_IMAGE", // POST_IMAGE, AVATAR, EMOJI
  "filename": "photo.jpg",
  "mimeType": "image/jpeg",
  "size": 1024000
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://minio.example.com/presigned-url...",
    "objectKey": "uploads/uuid-filename.jpg",
    "publicUrl": "https://example.com/api/media/uuid-filename.jpg"
  },
  "error": null
}
```

**Validation**:
- `POST_IMAGE`: max 10MB, images only
- `AVATAR`: max 5MB, images only (no GIF)
- `EMOJI`: max 5MB, images only

---

#### POST `/api/media/confirm`

Confirm upload completion and create database record.

**Auth**: Required

**Request**:
```json
{
  "objectKey": "uploads/uuid-filename.jpg",
  "purpose": "POST_IMAGE",
  "relatedPostId": "clx..." // Optional
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "mediaId": "clx...",
    "url": "https://example.com/api/media/uuid-filename.jpg"
  },
  "error": null
}
```

---

#### GET `/api/media/:objectKey`

Proxy media file from MinIO.

**Auth**: Not required (public media)

**Response**: Returns the actual file bytes with appropriate Content-Type header.

---

### Custom Emojis

#### GET `/api/emojis`

List current user's emojis.

**Auth**: Required

**Response** (200):
```json
{
  "success": true,
  "data": {
    "emojis": [
      {
        "id": "clx...",
        "name": "happy_cat",
        "keywords": "cat happy smile",
        "imageUrl": "https://example.com/api/media/emoji-uuid.gif",
        "createdAt": "2025-01-15T00:00:00.000Z"
      }
    ]
  },
  "error": null
}
```

---

#### GET `/api/emojis/search?q=:query`

Search user's emojis by name or keywords.

**Auth**: Required

**Query Parameters**:
- `q` - Search query (required)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "emojis": [ /* matching emojis */ ]
  },
  "error": null
}
```

---

#### POST `/api/emojis`

Create a custom emoji (use presign + confirm flow first).

**Auth**: Required

**Note**: Use media upload endpoints first, then reference in post/comment content as `:emoji_<id>:`

---

#### PATCH `/api/emojis/:id`

Update emoji metadata.

**Auth**: Required (owner only)

**Request**:
```json
{
  "name": "super_happy_cat",
  "keywords": "cat happy excited"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "emoji": { /* updated emoji */ }
  },
  "error": null
}
```

---

#### DELETE `/api/emojis/:id`

Delete a custom emoji.

**Auth**: Required (owner or admin)

**Response** (200):
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

---

### Admin Endpoints

All admin endpoints require `role: ADMIN`.

#### GET `/api/admin/audit`

Get audit log entries.

**Auth**: Required (ADMIN)

**Query Parameters**:
- `cursor` - Pagination cursor
- `limit` - Number of entries (default: 50)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "clx...",
        "action": "DELETE_POST",
        "actorId": "clx...",
        "actor": {
          "username": "admin",
          "displayName": "Admin User"
        },
        "targetType": "Post",
        "targetId": "clx...",
        "metadata": { "reason": "spam" },
        "createdAt": "2025-01-15T14:00:00.000Z"
      }
    ],
    "nextCursor": "clx...",
    "hasMore": true
  },
  "error": null
}
```

---

#### DELETE `/api/admin/posts/:id`

Admin delete any post.

**Auth**: Required (ADMIN)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "auditLogId": "clx..."
  },
  "error": null
}
```

**Note**: Creates audit log entry.

---

#### DELETE `/api/admin/comments/:id`

Admin delete any comment.

**Auth**: Required (ADMIN)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "auditLogId": "clx..."
  },
  "error": null
}
```

---

### System

#### GET `/api/health`

Health check endpoint.

**Auth**: Not required

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "2025-01-17T10:00:00.000Z",
  "database": "connected",
  "storage": "connected"
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `USER_EXISTS` | 409 | User already exists |
| `TAG_EXISTS` | 409 | Tag already exists |
| `FILE_TOO_LARGE` | 400 | File exceeds size limit |
| `INVALID_MIME_TYPE` | 400 | File type not allowed |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

Currently not implemented in MVP. Recommended for production:

- Auth endpoints: 5 requests/minute per IP
- API endpoints: 100 requests/minute per user
- Media upload: 20 uploads/hour per user

Implement with Redis or middleware.

---

## Webhook Events (Future)

Not implemented in MVP. Planned events:

- `post.created`
- `post.published`
- `comment.created`
- `reaction.added`
- `user.registered`

---

## Example Usage

### Complete Post Creation Flow

```javascript
// 1. Upload image (if needed)
const presignRes = await fetch('/api/media/presign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    purpose: 'POST_IMAGE',
    filename: 'photo.jpg',
    mimeType: 'image/jpeg',
    size: file.size
  })
})
const { uploadUrl, objectKey, publicUrl } = await presignRes.json()

// 2. Upload to MinIO
await fetch(uploadUrl, {
  method: 'PUT',
  body: file
})

// 3. Confirm upload
await fetch('/api/media/confirm', {
  method: 'POST',
  body: JSON.stringify({ objectKey, purpose: 'POST_IMAGE' })
})

// 4. Create post with image
await fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Post',
    content: `# Hello\n\n![Photo](${publicUrl})`,
    tags: ['photography'],
    status: 'PUBLISHED'
  })
})
```

---

## Client Libraries

### JavaScript/TypeScript

Use `fetch` API or libraries like `axios`.

### Authentication

```typescript
import { signIn, signOut, useSession } from 'next-auth/react'

// Login
await signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
  redirect: false
})

// Get session
const { data: session } = useSession()

// Logout
await signOut()
```

---

## Support

For API issues:
1. Check response error message
2. Verify authentication token
3. Check request body validation
4. Review server logs: `docker compose logs web`

For feature requests, see [MVP_FEATURES.md](./MVP_FEATURES.md).
