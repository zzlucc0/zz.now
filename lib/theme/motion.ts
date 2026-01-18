/**
 * Motion System
 * Slow, subtle, natural animations
 * Respects prefers-reduced-motion
 */

export const motion = {
  // Durations (slower than typical)
  duration: {
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  // Easing (natural, not springy)
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    enter: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },
  
  // Transform distances (small)
  translate: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get transition string respecting user preference
 */
export function getTransition(
  properties: string | string[],
  duration: keyof typeof motion.duration = 'normal',
  easing: keyof typeof motion.easing = 'standard'
): string {
  if (prefersReducedMotion()) {
    return 'none'
  }
  
  const props = Array.isArray(properties) ? properties : [properties]
  return props
    .map(prop => `${prop} ${motion.duration[duration]} ${motion.easing[easing]}`)
    .join(', ')
}
