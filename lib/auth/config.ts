import NextAuth, { DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db/prisma'
import { verifyPassword } from '@/lib/auth/password'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      username: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
    username: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.isActive) {
          return null
        }

        const isValid = await verifyPassword(
          user.passwordHash,
          credentials.password as string
        )

        if (!isValid) {
          return null
        }

        // Check if user should be promoted to ADMIN based on ADMIN_EMAILS
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
        const shouldBeAdmin = adminEmails.includes(user.email.toLowerCase())
        
        // Auto-promote to ADMIN if email matches and not already ADMIN
        if (shouldBeAdmin && user.role !== 'ADMIN') {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' },
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || user.username,
          role: shouldBeAdmin ? 'ADMIN' : user.role,
          username: user.username,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.username = token.username as string
      }
      return session
    },
  },
})
