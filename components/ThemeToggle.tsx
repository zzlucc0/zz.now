"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === "dark" : false

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      type="button"
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="theme-toggle group relative flex h-9 w-16 items-center rounded-full border border-border/60 bg-secondary/50 p-0.5 transition-all duration-300 hover:border-primary/50 hover:bg-secondary/70 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <span
        aria-hidden
        className={cn(
          "theme-toggle-indicator absolute flex h-7 w-7 items-center justify-center rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark
            ? "left-[calc(100%-1.875rem)] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-amber-200 rotate-[360deg]"
            : "left-0.5 bg-gradient-to-br from-amber-200 via-amber-100 to-yellow-50 text-amber-600 rotate-0"
        )}
      >
        {isDark ? (
          <Moon className="h-4 w-4 transition-transform duration-500" />
        ) : (
          <Sun className="h-4 w-4 transition-transform duration-500" />
        )}
      </span>
    </Button>
  )
}
