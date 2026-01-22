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
      aria-label="Toggle theme"
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="theme-toggle group relative flex h-10 w-[90px] items-center justify-between rounded-full border border-border/70 bg-secondary/80 px-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-all hover:border-primary/60 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <span
        aria-hidden
        className={cn(
          "theme-toggle-indicator absolute inset-y-1 left-1 flex w-[38px] items-center justify-center rounded-full bg-white/90 text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isDark
            ? "translate-x-[38px] bg-gradient-to-r from-slate-800 to-slate-600 text-teal-100"
            : "translate-x-0 bg-gradient-to-r from-amber-100 via-white to-teal-50 text-amber-600"
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5" />
        ) : (
          <Sun className="h-3.5 w-3.5" />
        )}
      </span>
      <span
        className={cn(
          "relative z-10 flex w-full items-center justify-between text-[0.65rem] font-medium",
          "transition-colors"
        )}
      >
        <span className={cn("flex items-center gap-1", isDark ? "text-muted-foreground/60" : "text-foreground")}>
          <Sun className="hidden h-3.5 w-3.5 sm:block" />
          Day
        </span>
        <span className={cn("flex items-center gap-1", isDark ? "text-foreground" : "text-muted-foreground/60")}>
          Night
          <Moon className="hidden h-3.5 w-3.5 sm:block" />
        </span>
      </span>
    </Button>
  )
}
