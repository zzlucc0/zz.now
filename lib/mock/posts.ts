import { mockUsers } from './users'

export interface MockPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE'
  publishedAt: Date | null
  createdAt: Date
  author: {
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
  _count: {
    comments: number
    reactions: number
  }
}

export const mockPosts: MockPost[] = [
  {
    id: 'post_1',
    title: 'Getting Started with Next.js 15',
    slug: 'getting-started-nextjs-15',
    excerpt: 'A gentle introduction to the latest features in Next.js 15, including React Server Components.',
    content: '# Getting Started\n\nNext.js 15 brings exciting new features...',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    publishedAt: new Date('2026-01-15'),
    createdAt: new Date('2026-01-14'),
    author: mockUsers[0],
    _count: { comments: 5, reactions: 12 }
  },
  {
    id: 'post_2',
    title: 'Building a Personal Knowledge Base',
    slug: 'building-personal-knowledge-base',
    excerpt: 'How I organized my notes, bookmarks, and learnings into a searchable system.',
    content: '# Knowledge Management\n\nAfter years of scattered notes...',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    publishedAt: new Date('2026-01-12'),
    createdAt: new Date('2026-01-11'),
    author: mockUsers[0],
    _count: { comments: 3, reactions: 8 }
  },
  {
    id: 'post_3',
    title: 'Weekend Project: Automated Backups',
    slug: 'weekend-project-automated-backups',
    excerpt: 'Setting up automated PostgreSQL and MinIO backups with simple bash scripts.',
    content: '# Backup Strategy\n\nReliable backups are essential...',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    publishedAt: new Date('2026-01-10'),
    createdAt: new Date('2026-01-09'),
    author: mockUsers[0],
    _count: { comments: 2, reactions: 6 }
  },
  {
    id: 'post_4',
    title: 'Thoughts on Remote Work',
    slug: 'thoughts-on-remote-work',
    excerpt: 'Reflections after three years of working from home.',
    content: '# Remote Work\n\nThree years in, here is what I have learned...',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    publishedAt: new Date('2026-01-08'),
    createdAt: new Date('2026-01-07'),
    author: mockUsers[0],
    _count: { comments: 7, reactions: 15 }
  },
  {
    id: 'post_5',
    title: 'Book Notes: Deep Work',
    slug: 'book-notes-deep-work',
    excerpt: 'Key takeaways from Cal Newport\'s Deep Work and how I apply them.',
    content: '# Deep Work Summary\n\nCal Newport argues that...',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    publishedAt: new Date('2026-01-05'),
    createdAt: new Date('2026-01-04'),
    author: mockUsers[0],
    _count: { comments: 4, reactions: 10 }
  }
]

export const getRecentPosts = (limit: number = 5) => {
  return mockPosts
    .filter(p => p.status === 'PUBLISHED' && p.visibility === 'PUBLIC')
    .sort((a, b) => {
      const dateA = a.publishedAt ? a.publishedAt.getTime() : 0
      const dateB = b.publishedAt ? b.publishedAt.getTime() : 0
      return dateB - dateA
    })
    .slice(0, limit)
}

export const getPostBySlug = (slug: string) => {
  return mockPosts.find(p => p.slug === slug)
}
