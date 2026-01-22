'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Briefcase, Wrench, Settings, LogOut, Linkedin, Instagram, Github } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import type { Session } from 'next-auth'

interface SidebarProps {
  session: Session | null
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/posts', label: 'Posts', icon: FileText },
    { href: '/projects', label: 'Projects', icon: Briefcase },
    { href: '/tools', label: 'Tools', icon: Wrench },
  ]

  const socialLinks = [
    {
      href: 'https://www.linkedin.com/in/zzlucc0',
      label: 'LinkedIn profile',
      icon: Linkedin,
    },
    {
      href: 'https://www.instagram.com/zzlucc0',
      label: 'Instagram profile',
      icon: Instagram,
    },
    {
      href: 'https://github.com/zzlucc0',
      label: 'GitHub profile',
      icon: Github,
    },
  ]

  return (
    <aside className="sidebar">
      {/* User section */}
      {session ? (
        <div className="sidebar-user">
          <Avatar className="h-9 w-9 border border-border bg-card">
            <AvatarFallback>
              {((session.user as any).displayName || session.user.username || 'U')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="sidebar-user-name truncate">
              {(session.user as any).displayName || session.user.username}
            </p>
            <p className="sidebar-user-handle truncate">
              @{session.user.username}
            </p>
          </div>
        </div>
      ) : (
        <div className="sidebar-user">
          <Avatar className="h-9 w-9 border border-border bg-card">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="sidebar-user-name">Guest</p>
          </div>
        </div>
      )}

      <Separator className="my-4 sidebar-separator" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${isActive(link.href) ? 'active' : ''}`}
            >
              <Icon className="sidebar-link-icon h-4 w-4" />
              {link.label}
            </Link>
          )
        })}

        {session && (
          <>
            <Separator className="my-2 sidebar-separator" />
            <Link
              href="/dashboard"
              className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <FileText className="sidebar-link-icon h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/editor/new"
              className={`sidebar-link ${isActive('/editor') ? 'active' : ''}`}
            >
              <FileText className="sidebar-link-icon h-4 w-4" />
              Write
            </Link>
          </>
        )}

        {!session && (
          <>
            <Separator className="my-2 sidebar-separator" />
            <Link href="/login" className="sidebar-link">
              Sign in
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex items-center gap-1.5" aria-label="Social links">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="sidebar-icon-link"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
        {session ? (
          <div className="flex items-center gap-2">
            <Link
              href="/settings/profile"
              className="sidebar-icon-link"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
