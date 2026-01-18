import { describe, it, expect } from '@jest/globals'
import { generateSlug, formatDate, truncate } from '@/lib/utils/helpers'

describe('Helper Functions', () => {
  describe('generateSlug', () => {
    it('should convert text to lowercase slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('should remove special characters', () => {
      expect(generateSlug('Hello, World!')).toBe('hello-world')
    })

    it('should handle multiple spaces', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world')
    })

    it('should handle accented characters', () => {
      expect(generateSlug('Café Münster')).toMatch(/^cafe-munster/)
    })

    it('should add random suffix for uniqueness', () => {
      const slug1 = generateSlug('test')
      const slug2 = generateSlug('test')
      expect(slug1).not.toBe(slug2)
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const formatted = formatDate(date)
      expect(formatted).toContain('Jan')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2024')
    })

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15')
      expect(formatted).toBeTruthy()
    })
  })

  describe('truncate', () => {
    it('should truncate long text', () => {
      const longText = 'a'.repeat(200)
      const truncated = truncate(longText, 100)
      expect(truncated.length).toBeLessThanOrEqual(103) // 100 + '...'
    })

    it('should not truncate short text', () => {
      const shortText = 'Hello World'
      expect(truncate(shortText, 100)).toBe(shortText)
    })

    it('should add ellipsis when truncated', () => {
      const longText = 'a'.repeat(200)
      const truncated = truncate(longText, 100)
      expect(truncated).toContain('...')
    })
  })
})
