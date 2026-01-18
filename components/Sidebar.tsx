'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Briefcase, Wrench, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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

  return (
    <aside className="sidebar">
      {/* User section */}
      <div className="space-y-4">
        {session ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {((session.user as any).displayName || session.user.username || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {(session.user as any).displayName || session.user.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                @{session.user.username}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">Guest</p>
            </div>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon
          return (
            <Button
              key={link.href}
              variant={isActive(link.href) ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              asChild
            >
              <Link href={link.href}>
                <Icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          )
        })}

        {session && (
          <>
            <Separator className="my-2" />
            <Button
              variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard">
                <FileText className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant={isActive('/editor') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              asChild
            >
              <Link href="/editor/new">
                <FileText className="mr-2 h-4 w-4" />
                Write
              </Link>
            </Button>
          </>
        )}

        {!session && (
          <>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t flex items-center justify-between">
        <ThemeToggle />
        {session && (
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings/profile">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </aside>
  )
}
