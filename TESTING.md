# Testing Checklist

Authorization and security testing checklist for the Personal Platform.

## Table of Contents

1. [Authentication Tests](#authentication-tests)
2. [Authorization Tests](#authorization-tests)
3. [Media Upload Tests](#media-upload-tests)
4. [API Security Tests](#api-security-tests)
5. [Performance Tests](#performance-tests)

---

## Authentication Tests

### Registration

- [ ] Can register with valid email and password
- [ ] Cannot register with existing email
- [ ] Cannot register with existing username
- [ ] Password must be at least 8 characters
- [ ] Username follows regex pattern (alphanumeric, underscore, hyphen only)
- [ ] Admin user is created with ADMIN role if email matches ADMIN_EMAILS

### Login

- [ ] Can login with correct credentials
- [ ] Cannot login with incorrect password
- [ ] Cannot login with non-existent email
- [ ] Cannot login if account is inactive
- [ ] Session persists across page reloads
- [ ] User is auto-promoted to ADMIN if email matches ADMIN_EMAILS

### Session Management

- [ ] Unauthenticated requests to protected routes return 401
- [ ] Session expires after inactivity
- [ ] User can logout successfully

---

## Authorization Tests

### Post Ownership

- [ ] **✓ CRITICAL**: User A cannot edit User B's post
- [ ] **✓ CRITICAL**: User A cannot delete User B's post  
- [ ] User can edit their own posts
- [ ] User can delete their own posts
- [ ] ADMIN can delete any post (including other users')
- [ ] ADMIN moderation is logged in audit trail

### Comment Ownership

- [ ] **✓ CRITICAL**: User A cannot edit User B's comment
- [ ] **✓ CRITICAL**: User A cannot delete User B's comment
- [ ] User can edit their own comments
- [ ] User can delete their own comments
- [ ] ADMIN can delete any comment
- [ ] Comment deletion logs the action

### Emoji Ownership

- [ ] **✓ CRITICAL**: User can only see their own emojis in emoji list
- [ ] **✓ CRITICAL**: User A cannot delete User B's emoji
- [ ] **✓ CRITICAL**: User A cannot edit User B's emoji
- [ ] User can manage (create/edit/delete) their own emojis
- [ ] ADMIN can delete any emoji (if enabled)

### Admin Access

- [ ] Regular users cannot access `/admin/moderation`
- [ ] Regular users cannot access `/admin/audit`
- [ ] Regular users get 403 when calling admin API endpoints
- [ ] ADMIN can access all admin pages and endpoints

---

## Media Upload Tests

### File Type Validation

- [ ] **✓ CRITICAL**: Only allowed MIME types can be uploaded
- [ ] POST_IMAGE accepts: image/png, image/jpeg, image/webp, image/gif
- [ ] AVATAR accepts: image/png, image/jpeg, image/webp (no GIFs)
- [ ] EMOJI accepts: image/png, image/jpeg, image/webp, image/gif
- [ ] Reject other file types (PDF, EXE, etc.)

### File Size Validation

- [ ] **✓ CRITICAL**: POST_IMAGE max 10MB
- [ ] **✓ CRITICAL**: AVATAR max 5MB
- [ ] **✓ CRITICAL**: EMOJI max 5MB
- [ ] Files exceeding limit are rejected with clear error
- [ ] Error message includes the size limit

### Upload Flow

- [ ] Presigned URL is generated successfully
- [ ] Upload to presigned URL works
- [ ] Confirm endpoint creates database record
- [ ] File is accessible via `/api/media/[...key]`
- [ ] Invalid object keys return 404

---

## API Security Tests

### Input Validation

- [ ] Zod schemas reject invalid input
- [ ] SQL injection attempts are blocked (Prisma prevents)
- [ ] XSS attempts in markdown are sanitized
- [ ] Invalid CUID IDs are rejected
- [ ] Long strings are truncated/rejected

### Rate Limiting

- [ ] (Future) Auth endpoints have rate limiting
- [ ] (Future) Excessive requests are throttled

### CSRF Protection

- [ ] NextAuth provides CSRF protection for auth routes
- [ ] API mutations require valid session

---

## API Endpoint Tests

### Authentication Endpoints

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Should return: {"user":{"id":"...","username":"testuser",...}}
```

### Posts Endpoints

```bash
# Get posts (public)
curl http://localhost:3000/api/posts

# Create post (requires auth)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"title":"Test Post","content":"Content here","status":"PUBLISHED"}'

# Update post (owner only)
curl -X PATCH http://localhost:3000/api/posts/[slug] \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{"title":"Updated Title"}'

# Delete post (owner or admin)
curl -X DELETE http://localhost:3000/api/posts/[slug] \
  -H "Cookie: ..."
```

### Comments Endpoints

```bash
# Create comment
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{"postId":"...","content":"Nice post!"}'

# Update comment (owner only)
curl -X PATCH http://localhost:3000/api/comments/[id] \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{"content":"Updated comment"}'

# Delete comment (owner or admin)
curl -X DELETE http://localhost:3000/api/comments/[id] \
  -H "Cookie: ..."
```

### Emoji Endpoints

```bash
# List user's emojis
curl http://localhost:3000/api/emojis \
  -H "Cookie: ..."

# Search emojis
curl "http://localhost:3000/api/emojis/search?q=happy" \
  -H "Cookie: ..."

# Delete emoji (owner only)
curl -X DELETE http://localhost:3000/api/emojis/[id] \
  -H "Cookie: ..."
```

### Media Endpoints

```bash
# Request presigned URL
curl -X POST http://localhost:3000/api/media/presign \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{"purpose":"POST_IMAGE","filename":"test.jpg","mimeType":"image/jpeg","size":500000}'

# Confirm upload
curl -X POST http://localhost:3000/api/media/confirm \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{"objectKey":"...","purpose":"POST_IMAGE"}'
```

### Admin Endpoints

```bash
# Admin delete post
curl -X DELETE http://localhost:3000/api/admin/posts/[id] \
  -H "Cookie: [admin-session]"

# Admin delete comment
curl -X DELETE http://localhost:3000/api/admin/comments/[id] \
  -H "Cookie: [admin-session]"

# View audit logs
curl http://localhost:3000/api/admin/audit \
  -H "Cookie: [admin-session]"
```

---

## Security Scenarios to Test

### Scenario 1: Unauthorized Post Modification

1. User A creates a post
2. User B logs in
3. User B attempts to PATCH User A's post
4. **Expected**: 403 Forbidden
5. **Actual**: ___

### Scenario 2: Unauthorized Post Deletion

1. User A creates a post
2. User B logs in
3. User B attempts to DELETE User A's post
4. **Expected**: 403 Forbidden
5. **Actual**: ___

### Scenario 3: Admin Post Deletion

1. User A creates a post
2. Admin logs in
3. Admin deletes User A's post
4. **Expected**: Success, logged in audit
5. **Actual**: ___

### Scenario 4: Emoji Isolation

1. User A uploads emoji "smile"
2. User B logs in
3. User B lists emojis
4. **Expected**: Only User B's emojis shown
5. **Actual**: ___

### Scenario 5: File Upload Restrictions

1. User attempts to upload 15MB image
2. **Expected**: 400 error, "File too large"
3. **Actual**: ___

4. User attempts to upload PDF
5. **Expected**: 400 error, "Invalid file type"
6. **Actual**: ___

### Scenario 6: Admin Promotion

1. Register with email matching ADMIN_EMAILS
2. **Expected**: User role = ADMIN
3. **Actual**: ___

4. Regular user logs in
5. Admin updates ADMIN_EMAILS to include user's email
6. User logs in again
7. **Expected**: User auto-promoted to ADMIN
8. **Actual**: ___

---

## Performance Tests

### Load Testing

- [ ] Can handle 100 concurrent users
- [ ] Post list pagination performs well with 1000+ posts
- [ ] Comment threads with 100+ comments load quickly
- [ ] Image serving doesn't bottleneck under load

### Database Performance

- [ ] Queries use proper indexes
- [ ] No N+1 query problems
- [ ] Audit log queries are efficient with large datasets

---

## Browser Tests

### Cross-Browser Compatibility

- [ ] Works in Chrome/Edge
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Mobile responsive design

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Proper ARIA labels
- [ ] Color contrast meets WCAG standards

---

## Production Checklist

Before deploying to production:

- [ ] All critical authorization tests pass
- [ ] ADMIN_EMAILS configured correctly
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database passwords changed from defaults
- [ ] MinIO credentials changed from defaults
- [ ] SSL/HTTPS configured
- [ ] Backups tested and working
- [ ] Health check endpoint returns healthy
- [ ] Audit logs recording correctly
- [ ] Error pages tested (404, 500)

---

## Test Reports

### Test Run 1: [Date]

**Tester**: ___  
**Environment**: Development/Production  

| Test Category | Passed | Failed | Notes |
|--------------|--------|--------|-------|
| Authentication | __ / __ | __ | |
| Authorization | __ / __ | __ | |
| Media Upload | __ / __ | __ | |
| API Security | __ / __ | __ | |

**Critical Issues**: ___

**Recommendations**: ___

---

## Automated Testing (Future)

### Unit Tests

```bash
# Install testing dependencies
npm install -D jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

### Integration Tests

```bash
# API integration tests
npm run test:integration
```

### E2E Tests

```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npx playwright test
```

---

## Security Audit

### Tools to Use

- **npm audit**: Check for vulnerable dependencies
- **OWASP ZAP**: Web application security scanner
- **Lighthouse**: Security and performance audit

```bash
# Run npm audit
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## Test Coverage Goals

- [ ] 80%+ coverage for auth logic
- [ ] 90%+ coverage for authorization helpers
- [ ] 100% coverage for validation schemas
- [ ] Integration tests for all API routes

---

**Last Updated**: [Date]  
**Next Review**: [Date]
