export interface MockUser {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  role: 'ADMIN' | 'USER'
}

export const mockUsers: MockUser[] = [
  {
    id: 'user_1',
    username: 'alice',
    displayName: 'Alice Chen',
    avatarUrl: null,
    role: 'ADMIN'
  },
  {
    id: 'user_2',
    username: 'bob',
    displayName: 'Bob Kim',
    avatarUrl: null,
    role: 'USER'
  },
  {
    id: 'user_3',
    username: 'charlie',
    displayName: null,
    avatarUrl: null,
    role: 'USER'
  }
]

export const getCurrentUser = () => mockUsers[0]
