#!/bin/bash

# Authorization Testing Script
# This script tests critical authorization checks in the Personal Platform

set -e

echo "=================================================="
echo "Personal Platform - Authorization Testing Script"
echo "=================================================="
echo ""

BASE_URL="${BASE_URL:-http://localhost:3000}"
echo "Testing against: $BASE_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
  local test_name="$1"
  local method="$2"
  local endpoint="$3"
  local expected_status="$4"
  local cookie="$5"
  
  echo -n "Testing: $test_name ... "
  
  if [ -z "$cookie" ]; then
    response_status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$endpoint")
  else
    response_status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$endpoint" -H "Cookie: $cookie")
  fi
  
  if [ "$response_status" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (got $response_status)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} (expected $expected_status, got $response_status)"
    ((FAILED++))
  fi
}

echo "=================================================="
echo "1. Authentication Tests"
echo "=================================================="
echo ""

# Test health endpoint (public)
test_endpoint "Health check is public" "GET" "/api/health" "200"

# Test protected endpoint without auth
test_endpoint "Protected endpoint requires auth" "GET" "/api/me" "401"

# Test admin endpoint without auth
test_endpoint "Admin endpoint requires auth" "GET" "/api/admin/audit" "401"

echo ""
echo "=================================================="
echo "2. Manual Authorization Tests (Requires Users)"
echo "=================================================="
echo ""

echo -e "${YELLOW}⚠ The following tests require manual setup:${NC}"
echo ""
echo "Prerequisites:"
echo "1. Start the application: npm run dev"
echo "2. Create User A account"
echo "3. Create User B account"
echo "4. User A creates a post (note the post ID)"
echo "5. User A creates a comment (note the comment ID)"
echo ""
echo "Then test the following:"
echo ""
echo "✓ Post Authorization:"
echo "  - User A can edit their own post: PATCH /api/posts/[postId]"
echo "  - User B CANNOT edit User A's post: should return 403"
echo "  - User B CANNOT delete User A's post: should return 403"
echo "  - Admin CAN delete any post: should return 200 + audit log"
echo ""
echo "✓ Comment Authorization:"
echo "  - User A can edit their own comment: PATCH /api/comments/[commentId]"
echo "  - User B CANNOT edit User A's comment: should return 403"
echo "  - User B CANNOT delete User A's comment: should return 403"
echo "  - Admin CAN delete any comment: should return 200"
echo ""
echo "✓ Emoji Authorization:"
echo "  - User A can only see their own emojis: GET /api/emojis"
echo "  - User B CANNOT delete User A's emoji: should return 403"
echo "  - User B CANNOT edit User A's emoji: should return 403"
echo ""

echo ""
echo "=================================================="
echo "3. File Upload Validation Tests"
echo "=================================================="
echo ""

echo -e "${YELLOW}⚠ Manual testing required:${NC}"
echo ""
echo "✓ MIME Type Validation:"
echo "  - Upload PNG image to POST_IMAGE: should succeed"
echo "  - Upload JPEG image to AVATAR: should succeed"
echo "  - Upload GIF to EMOJI: should succeed"
echo "  - Upload PDF as image: should FAIL with MIME error"
echo "  - Upload EXE file: should FAIL with MIME error"
echo ""
echo "✓ File Size Validation:"
echo "  - Upload 8MB image to POST_IMAGE: should succeed (< 10MB)"
echo "  - Upload 11MB image to POST_IMAGE: should FAIL (> 10MB)"
echo "  - Upload 4MB image to AVATAR: should succeed (< 5MB)"
echo "  - Upload 6MB image to AVATAR: should FAIL (> 5MB)"
echo "  - Upload 3MB GIF to EMOJI: should succeed (< 5MB)"
echo ""

echo ""
echo "=================================================="
echo "4. Database Integrity Tests"
echo "=================================================="
echo ""

echo -e "${YELLOW}⚠ Run with Prisma Studio or psql:${NC}"
echo ""
echo "✓ Foreign Key Constraints:"
echo "  - Cannot create post with non-existent authorId"
echo "  - Cannot create comment with non-existent postId"
echo "  - Cannot create reaction with non-existent userId"
echo ""
echo "✓ Unique Constraints:"
echo "  - Cannot create user with duplicate email"
echo "  - Cannot create user with duplicate username"
echo "  - Cannot create post with duplicate slug"
echo "  - Cannot create tag with duplicate slug"
echo ""

echo ""
echo "=================================================="
echo "Test Summary"
echo "=================================================="
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed: $FAILED${NC}"
else
  echo -e "${GREEN}Failed: 0${NC}"
fi
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All automated tests passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Complete manual authorization tests (see above)"
  echo "2. Test file upload validation with real files"
  echo "3. Verify audit logging in admin panel"
  echo "4. Test with different user roles (USER, ADMIN)"
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Please review.${NC}"
  exit 1
fi
