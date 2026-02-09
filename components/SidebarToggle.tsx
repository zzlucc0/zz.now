'use client'

import { useSidebar } from './SidebarContext'

interface SidebarToggleProps {
  className?: string
}

export function SidebarToggle({ className }: SidebarToggleProps) {
  const { isOpen, toggle } = useSidebar()
  const classes = ['sidebar-toggle', className].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={classes}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      onClick={toggle}
    >
      <span className="sidebar-toggle-lines" aria-hidden>
        <span className="sidebar-toggle-line" />
        <span className="sidebar-toggle-line" />
        <span className="sidebar-toggle-line" />
      </span>
    </button>
  )
}
