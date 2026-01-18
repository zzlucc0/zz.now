'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { applyThemeTokens, type ThemeMode } from '@/lib/theme/tokens'

interface ThemeContextType {
  mode: ThemeMode
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('day')
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme-mode') as ThemeMode | null
    const initial = stored || 'day'
    setMode(initial)
    applyThemeTokens(initial)
    setMounted(true)
  }, [])

  // Apply theme whenever it changes
  useEffect(() => {
    if (mounted) {
      applyThemeTokens(mode)
      localStorage.setItem('theme-mode', mode)
    }
  }, [mode, mounted])

  const toggle = () => {
    setMode(prev => prev === 'day' ? 'night' : 'day')
  }

  // Always provide context, but hide content until mounted to prevent FOUC
  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
