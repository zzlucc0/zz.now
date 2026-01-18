export interface MockTag {
  id: string
  name: string
  _count: {
    posts: number
  }
}

export const mockTags: MockTag[] = [
  { id: 'tag_1', name: 'Next.js', _count: { posts: 8 } },
  { id: 'tag_2', name: 'React', _count: { posts: 12 } },
  { id: 'tag_3', name: 'TypeScript', _count: { posts: 15 } },
  { id: 'tag_4', name: 'DevOps', _count: { posts: 5 } },
  { id: 'tag_5', name: 'Productivity', _count: { posts: 7 } },
  { id: 'tag_6', name: 'Books', _count: { posts: 4 } }
]

export const getAllTags = () => mockTags
