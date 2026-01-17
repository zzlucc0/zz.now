import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth/password'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Get admin emails from environment
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []

  if (adminEmails.length === 0) {
    console.log('⚠️  No ADMIN_EMAILS configured. Skipping admin user creation.')
  } else {
    console.log(`📧 Admin emails configured: ${adminEmails.join(', ')}`)

    // Create admin users
    for (const email of adminEmails) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        console.log(`✓ Admin user already exists: ${email}`)
        
        // Ensure user has ADMIN role
        if (existingUser.role !== 'ADMIN') {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: 'ADMIN' },
          })
          console.log(`  → Promoted to ADMIN role`)
        }
      } else {
        const username = email.split('@')[0]
        const passwordHash = await hashPassword('changeme123') // Default password

        const user = await prisma.user.create({
          data: {
            email,
            username: username + '_admin',
            passwordHash,
            displayName: `Admin ${username}`,
            role: 'ADMIN',
          },
        })

        console.log(`✓ Created admin user: ${email}`)
        console.log(`  → Username: ${user.username}`)
        console.log(`  → Default password: changeme123`)
        console.log(`  ⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!`)
      }
    }
  }

  // Create sample tags
  console.log('\n🏷️  Creating sample tags...')
  const tags = ['Tutorial', 'Update', 'Announcement', 'Guide']
  
  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { slug: tagName.toLowerCase() },
      update: {},
      create: {
        name: tagName,
        slug: tagName.toLowerCase(),
      },
    })
  }
  console.log(`✓ Created ${tags.length} tags`)

  // Create a sample user (non-admin)
  console.log('\n👤 Creating sample user...')
  const sampleUserEmail = 'user@example.com'
  const sampleUser = await prisma.user.upsert({
    where: { email: sampleUserEmail },
    update: {},
    create: {
      email: sampleUserEmail,
      username: 'demo_user',
      passwordHash: await hashPassword('demo123'),
      displayName: 'Demo User',
      role: 'USER',
    },
  })
  console.log(`✓ Sample user: ${sampleUserEmail} (password: demo123)`)

  // Create a sample post
  console.log('\n📝 Creating sample post...')
  const welcomePost = await prisma.post.upsert({
    where: { slug: 'welcome-to-personal-platform' },
    update: {},
    create: {
      title: 'Welcome to Personal Platform!',
      slug: 'welcome-to-personal-platform',
      content: `# Welcome!

This is your new personal platform. Here's what you can do:

## Features

- **Create Posts**: Share your thoughts with markdown support
- **Comment & React**: Engage with the community
- **Custom Emojis**: Upload and use your own emoji reactions
- **Projects Showcase**: Display your work
- **Extensible Tools**: Add custom tools easily

## Getting Started

1. Sign up for an account
2. Explore the posts
3. Create your first post
4. Check out the Projects and Tools sections

## Tech Stack

This platform is built with:
- Next.js 15
- TypeScript
- PostgreSQL
- Prisma ORM
- MinIO Storage
- Docker

Feel free to explore and enjoy!`,
      excerpt: 'Welcome to your new personal platform! Explore features and get started.',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      publishedAt: new Date(),
      authorId: sampleUser.id,
      tags: {
        connect: [
          { slug: 'announcement' },
          { slug: 'guide' },
        ],
      },
    },
  })
  console.log(`✓ Sample post created: ${welcomePost.title}`)

  console.log('\n✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
