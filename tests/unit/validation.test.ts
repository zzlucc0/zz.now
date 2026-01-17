import { describe, it, expect } from '@jest/globals'
import { 
  registerSchema, 
  createPostSchema, 
  createCommentSchema,
  createReactionSchema,
  createTagSchema,
  createEmojiSchema,
} from '@/lib/validations/schemas'

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const valid = {
        username: 'validuser',
        email: 'valid@example.com',
        password: 'SecurePass123!',
      }
      expect(() => registerSchema.parse(valid)).not.toThrow()
    })

    it('should reject short username', () => {
      const invalid = {
        username: 'ab',
        email: 'valid@example.com',
        password: 'SecurePass123!',
      }
      expect(() => registerSchema.parse(invalid)).toThrow()
    })

    it('should reject invalid email', () => {
      const invalid = {
        username: 'validuser',
        email: 'not-an-email',
        password: 'SecurePass123!',
      }
      expect(() => registerSchema.parse(invalid)).toThrow()
    })

    it('should reject weak password', () => {
      const invalid = {
        username: 'validuser',
        email: 'valid@example.com',
        password: '123',
      }
      expect(() => registerSchema.parse(invalid)).toThrow()
    })
  })

  describe('createPostSchema', () => {
    it('should accept valid post data', () => {
      const valid = {
        title: 'Valid Title',
        content: 'Valid content',
        status: 'DRAFT',
        visibility: 'PUBLIC',
      }
      expect(() => createPostSchema.parse(valid)).not.toThrow()
    })

    it('should reject empty title', () => {
      const invalid = {
        title: '',
        content: 'Valid content',
      }
      expect(() => createPostSchema.parse(invalid)).toThrow()
    })

    it('should reject invalid status', () => {
      const invalid = {
        title: 'Valid Title',
        content: 'Valid content',
        status: 'INVALID_STATUS',
      }
      expect(() => createPostSchema.parse(invalid)).toThrow()
    })
  })

  describe('createCommentSchema', () => {
    it('should accept valid comment', () => {
      const valid = {
        postId: 'clz123456789',
        content: 'This is a valid comment',
      }
      expect(() => createCommentSchema.parse(valid)).not.toThrow()
    })

    it('should reject empty content', () => {
      const invalid = {
        postId: 'clz123456789',
        content: '',
      }
      expect(() => createCommentSchema.parse(invalid)).toThrow()
    })

    it('should accept nested comments with parentId', () => {
      const valid = {
        postId: 'clz123456789',
        content: 'Reply comment',
        parentId: 'clz987654321',
      }
      expect(() => createCommentSchema.parse(valid)).not.toThrow()
    })
  })

  describe('createReactionSchema', () => {
    it('should accept valid reaction types', () => {
      const types = ['LIKE', 'LOVE', 'LAUGH', 'THINKING']
      types.forEach(type => {
        const valid = { postId: 'clz123456789', type }
        expect(() => createReactionSchema.parse(valid)).not.toThrow()
      })
    })

    it('should reject invalid reaction type', () => {
      const invalid = {
        postId: 'clz123456789',
        type: 'INVALID',
      }
      expect(() => createReactionSchema.parse(invalid)).toThrow()
    })
  })

  describe('createTagSchema', () => {
    it('should accept valid tag', () => {
      const valid = { name: 'JavaScript' }
      expect(() => createTagSchema.parse(valid)).not.toThrow()
    })

    it('should reject empty name', () => {
      const invalid = { name: '' }
      expect(() => createTagSchema.parse(invalid)).toThrow()
    })

    it('should reject names that are too long', () => {
      const invalid = { name: 'a'.repeat(51) }
      expect(() => createTagSchema.parse(invalid)).toThrow()
    })
  })

  describe('createEmojiSchema', () => {
    it('should accept valid emoji', () => {
      const valid = {
        name: 'custom_emoji',
        imageUrl: 'https://example.com/emoji.png',
      }
      expect(() => createEmojiSchema.parse(valid)).not.toThrow()
    })

    it('should reject invalid image URL', () => {
      const invalid = {
        name: 'custom_emoji',
        imageUrl: 'not-a-url',
      }
      expect(() => createEmojiSchema.parse(invalid)).toThrow()
    })
  })
})
