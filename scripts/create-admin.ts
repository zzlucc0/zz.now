#!/usr/bin/env tsx
import { prisma } from '../lib/db/prisma'
import { hashPassword } from '../lib/auth/password'

async function createAdminUser() {
  try {
    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'zz' },
          { email: 'zz@admin.com' },
        ],
      },
    })

    if (existing) {
      console.log('❌ User "zz" already exists!')
      console.log('User details:', {
        id: existing.id,
        username: existing.username,
        email: existing.email,
        role: existing.role,
      })
      return
    }

    // Create admin user
    const passwordHash = await hashPassword('123456')
    
    const admin = await prisma.user.create({
      data: {
        username: 'zz',
        email: 'zz@admin.com',
        passwordHash,
        displayName: 'ZZ Admin',
        role: 'ADMIN',
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('Login credentials:')
    console.log('  Username: zz')
    console.log('  Email: zz@admin.com')
    console.log('  Password: 123456')
    console.log('  Role: ADMIN')
    console.log('')
    console.log('⚠️  IMPORTANT: Change this password after first login!')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

createAdminUser()
