'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import type { Session } from 'next-auth'

interface SidebarProps {
  session: Session | null
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: '◆' },
    { href: '/posts', label: 'Posts', icon: '◇' },
    { href: '/projects', label: 'Projects', icon: '○' },
    { href: '/tools', label: 'Tools', icon: '△' },
  ]

  const userLinks = session ? [
    { href: '/dashboard', label: 'Dashboard', icon: '◈' },
    { href: '/editor/new', label: 'Write', icon: '✎' },
    ...(session.user.role === 'ADMIN' ? [
      { href: '/admin/moderation', label: 'Admin', icon: '⚑' }
    ] : []),
  ] : []

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="sidebar-hamburger"
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-inner">
          {/* User info */}
          <div className="sidebar-user">
            {session ? (
              <>
                <div className="sidebar-avatar">
                  {(session.user as any).avatarUrl ? (
                    <img src={(session.user as any).avatarUrl} alt={session.user.username || ''} />
                  ) : (
                    <span>{(session.user.username || 'U')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{(session.user as any).displayName || session.user.username}</div>
                  <div className="sidebar-user-meta">@{session.user.username}</div>
                </div>
              </>
            ) : (
              <div className="sidebar-guest">
                <div className="sidebar-avatar">
                  <span>?</span>
                </div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">Guest</div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${isActive(link.href) ? 'sidebar-link-active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                <span className="sidebar-link-label">{link.label}</span>
              </Link>
            ))}

            {userLinks.length > 0 && (
              <>
                <div className="sidebar-divider" />
                {userLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`sidebar-link ${isActive(link.href) ? 'sidebar-link-active' : ''}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <span className="sidebar-link-icon">{link.icon}</span>
                    <span className="sidebar-link-label">{link.label}</span>
                  </Link>
                ))}
              </>
            )}

            {!session && (
              <>
                <div className="sidebar-divider" />
                <Link
                  href="/login"
                  className="sidebar-link"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <span className="sidebar-link-icon">→</span>
                  <span className="sidebar-link-label">Sign in</span>
                </Link>
              </>
            )}
          </nav>

          {/* Bottom section */}
          <div className="sidebar-footer">
            <ThemeToggle />
            {session && (
              <Link href="/settings/profile" className="sidebar-settings">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
