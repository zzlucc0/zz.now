#!/bin/bash

# Personal Platform - Setup Script
# This script sets up the local development environment

set -e

echo "🚀 Setting up Personal Platform..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

echo "✅ Docker is running"

# Start Docker services
echo "📦 Starting PostgreSQL and MinIO..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Run Prisma migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

# Generate Prisma client
echo "⚙️  Generating Prisma client..."
npx prisma generate

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Run 'npm run dev' to start the development server"
echo "  2. Visit http://localhost:3000 to see your app"
echo "  3. Visit http://localhost:9001 to access MinIO console"
echo "     (Login: $MINIO_ROOT_USER / $MINIO_ROOT_PASSWORD)"
echo ""
echo "📚 Useful commands:"
echo "  - npm run dev          - Start development server"
echo "  - npx prisma studio    - Open database GUI"
echo "  - docker-compose logs  - View service logs"
echo ""
