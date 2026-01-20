#!/usr/bin/env tsx
import { prisma } from '../lib/db/prisma'
import { hashPassword } from '../lib/auth/password'

function getRequiredEnv(key: string) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

async function createAdminUser() {
  try {
    const username = getRequiredEnv('ADMIN_BOOTSTRAP_USERNAME')
    const email = getRequiredEnv('ADMIN_BOOTSTRAP_EMAIL')
    const password = getRequiredEnv('ADMIN_BOOTSTRAP_PASSWORD')
    const displayName = process.env.ADMIN_BOOTSTRAP_DISPLAY_NAME ?? username

    if (password.length < 8) {
      throw new Error('ADMIN_BOOTSTRAP_PASSWORD must be at least 8 characters long')
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    })

    if (existing) {
      console.log(`❌ User "${username}" already exists!`)
      console.log('User details:', {
        id: existing.id,
        username: existing.username,
        email: existing.email,
        role: existing.role,
      })
      return
    }

    // Create admin user
    const passwordHash = await hashPassword(password)
    
    const admin = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        displayName,
        role: 'ADMIN',
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('Login credentials:')
    console.log(`  Username: ${username}`)
    console.log(`  Email: ${email}`)
    console.log('  Password: (hidden) — stored in ADMIN_BOOTSTRAP_PASSWORD')
    console.log('  Role: ADMIN')
    console.log('')
    console.log('⚠️  IMPORTANT: Change this password after first login!')
    console.log('⚠️  Remove ADMIN_BOOTSTRAP_* values from your local env once you are done.')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

createAdminUser()
