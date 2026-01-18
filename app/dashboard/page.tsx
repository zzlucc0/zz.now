import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { DeletePostButton } from '@/components/DeletePostButton'

async function getUserData(userId: string) {
  const [user, posts, comments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        bio: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            reactions: true,
          },
        },
      },
    }),
    prisma.post.findMany({
      where: { authorId: userId },
      include: {
        tags: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
    prisma.comment.findMany({
      where: { authorId: userId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  return { user, posts, comments }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const { user, posts, comments } = await getUserData(session.user.id)

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user.displayName || user.username}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Posts</p>
              <p className="text-3xl font-bold">{user._count.posts}</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Comments</p>
              <p className="text-3xl font-bold">{user._count.comments}</p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Reactions</p>
              <p className="text-3xl font-bold">{user._count.reactions}</p>
            </div>
            <div className="text-4xl">❤️</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/editor/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ✍️ Write New Post
          </Link>
          <Link
            href="/settings/profile"
            className="px-6 py-3 border rounded-lg hover:bg-gray-50"
          >
            ⚙️ Edit Profile
          </Link>
          <Link
            href="/settings/emojis"
            className="px-6 py-3 border rounded-lg hover:bg-gray-50"
          >
            😀 Manage Emojis
          </Link>
          {user.role === 'ADMIN' && (
            <Link
              href="/admin/moderation"
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🛡️ Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Posts</h2>
          <Link href="/posts" className="text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              You haven't created any posts yet
            </p>
            <Link
              href="/editor/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {post.title}
                      </Link>
                      {post.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-0.5 bg-gray-100 text-xs rounded"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          post.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      💬 {post._count.comments} • ❤️ {post._count.reactions}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/editor/${post.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </Link>
                        <DeletePostButton 
                          postSlug={post.slug}
                          variant="link"
                          className="text-red-600 hover:underline text-sm p-0 h-auto"
                          onSuccess={() => window.location.reload()}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Comments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Recent Comments</h2>
        </div>

        {comments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">You haven't commented on any posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white border rounded-lg p-4 hover:shadow transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <Link
                    href={`/posts/${comment.post.slug}#comment-${comment.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    on "{comment.post.title}"
                  </Link>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 line-clamp-2">{comment.content}</p>
                <div className="mt-2 flex gap-2">
                  <Link
                    href={`/posts/${comment.post.slug}#comment-${comment.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
