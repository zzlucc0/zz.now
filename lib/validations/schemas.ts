import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  displayName: z.string().min(1).max(100).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).default('PUBLIC'),
  tags: z.array(z.string()).optional(),
})

export const updatePostSchema = createPostSchema.partial()

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  postId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
})

export const createReactionSchema = z.object({
  type: z.enum(['LIKE', 'LOVE', 'LAUGH', 'THINKING', 'CUSTOM']),
  postId: z.string().cuid().optional(),
  commentId: z.string().cuid().optional(),
})

export const createCustomEmojiSchema = z.object({
  name: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  image: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, {
    message: 'File size must be less than 5MB',
  }),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type CreateReactionInput = z.infer<typeof createReactionSchema>
export type CreateCustomEmojiInput = z.infer<typeof createCustomEmojiSchema>
