import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/config'

interface PageProps {
  params: Promise<{ username: string }>
}

async function getUserProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  // Get user's published posts
  const posts = await prisma.post.findMany({
    where: {
      authorId: user.id,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
      tags: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  })

  return { user, posts }
}

export default async function UserProfilePage({ params }: PageProps) {
  const session = await auth()
  const { username } = await params
  const data = await getUserProfile(username)

  if (!data) {
    notFound()
  }

  const { user, posts } = data
  const isOwnProfile = session?.user?.id === user.id

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName || user.username}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-3xl font-bold">
                {(user.displayName || user.username)[0].toUpperCase()}
              </span>
            </div>
          )}

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold">
                  {user.displayName || user.username}
                </h1>
                <p className="text-gray-600">@{user.username}</p>
              </div>

              {isOwnProfile && (
                <Link
                  href="/settings/profile"
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Edit Profile
                </Link>
              )}
            </div>

            {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <strong>{user._count.posts}</strong> posts
              </span>
              <span className="flex items-center gap-1">
                <strong>{user._count.comments}</strong> comments
              </span>
              <span className="flex items-center gap-1">
                📅 Joined{' '}
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Recent Posts {posts.length > 0 && `(${posts.length})`}
        </h2>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">
              {isOwnProfile
                ? "You haven't published any posts yet."
                : 'This user has not published any posts yet.'}
            </p>
            {isOwnProfile && (
              <Link
                href="/editor/new"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <Link href={`/posts/${post.slug}`}>
                  <h3 className="text-xl font-bold mb-2 hover:text-blue-600">
                    {post.title}
                  </h3>
                </Link>

                {post.excerpt && (
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.slug}
                        href={`/posts?tag=${tag.slug}`}
                        className="px-2 py-1 bg-gray-100 text-xs rounded-full hover:bg-gray-200"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Not published'}
                  </span>
                  <span>💬 {post._count.comments}</span>
                  <span>❤️ {post._count.reactions}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        {posts.length === 10 && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Showing most recent 10 posts
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
