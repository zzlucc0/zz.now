/**
 * Design Token System
 * Two modes: DAY (Minimal) and NIGHT (Dark Cozy)
 * Same structure, different values
 */

export type ThemeMode = 'day' | 'night'

export interface ThemeTokens {
  // Backgrounds
  background: string      // Page background
  surface: string         // Cards, panels
  surfaceHover: string   // Hover state for surfaces
  
  // Text
  text: string           // Primary text
  textMuted: string      // Secondary text
  textSubtle: string     // Tertiary text
  
  // Borders & Dividers
  border: string         // Default borders
  borderSubtle: string   // Very light borders
  
  // Accent & Interactive
  accent: string         // Primary accent color
  accentHover: string    // Hover state
  accentMuted: string    // Muted accent backgrounds
  
  // Status colors
  success: string
  warning: string
  danger: string
  
  // Special
  shadow: string         // Shadow color with opacity
}

export const dayTokens: ThemeTokens = {
  // Warm off-white backgrounds
  background: '#faf9f7',        // Warm cream paper
  surface: '#ffffff',           // Pure white for cards
  surfaceHover: '#f8f7f5',      // Slight darkening on hover
  
  // Soft dark text (never pure black)
  text: '#2a2826',              // Warm very dark brown
  textMuted: '#6b6763',         // Warm medium gray
  textSubtle: '#9d9892',        // Light gray
  
  // Minimal borders
  border: '#e8e6e3',            // Very light warm gray
  borderSubtle: '#f0efed',      // Almost invisible
  
  // Calm brown accent (replacing blue)
  accent: '#8b7355',            // Warm brown
  accentHover: '#6d5940',       // Darker brown
  accentMuted: '#f5f2ef',       // Very light brown tint
  
  // Status
  success: '#5a7a5a',           // Muted green
  warning: '#9a7c4d',           // Warm amber
  danger: '#9a5a5a',            // Muted red
  
  shadow: 'rgba(0, 0, 0, 0.03)' // Extremely subtle
}

export const nightTokens: ThemeTokens = {
  // Deep warm backgrounds
  background: '#1a1816',        // Deep warm charcoal
  surface: '#242220',           // Slightly lifted charcoal
  surfaceHover: '#2c2927',      // Lighter on hover
  
  // Warm off-white text
  text: '#e8e6e3',              // Warm off-white
  textMuted: '#a8a5a0',         // Warm medium gray
  textSubtle: '#6b6763',        // Darker gray
  
  // Subtle borders
  border: '#3a3835',            // Warm dark border
  borderSubtle: '#2d2b28',      // Very subtle
  
  // Warm accent
  accent: '#b8996f',            // Light warm brown
  accentHover: '#d4b88f',       // Lighter hover
  accentMuted: '#2d2824',       // Dark brown tint
  
  // Status (all muted for night)
  success: '#7a9a7a',           // Soft green
  warning: '#ba9c6d',           // Soft amber
  danger: '#ba7a7a',            // Soft red
  
  shadow: 'rgba(0, 0, 0, 0.2)'  // Diffused ambient
}

export function getThemeTokens(mode: ThemeMode): ThemeTokens {
  return mode === 'day' ? dayTokens : nightTokens
}

/**
 * Apply theme tokens to CSS custom properties
 */
export function applyThemeTokens(mode: ThemeMode) {
  const tokens = getThemeTokens(mode)
  const root = document.documentElement
  
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })
  
  // Also set data attribute for any CSS selectors
  root.setAttribute('data-theme', mode)
}
