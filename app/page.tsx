import Link from 'next/link'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

async function getRecentPosts() {
  return prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    },
    take: 5,
    orderBy: { publishedAt: 'desc' },
    include: {
      author: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
  })
}

async function getRecentActivity() {
  const comments = await prisma.comment.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          username: true,
          displayName: true,
        },
      },
      post: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  })
  return comments
}

export default async function HomePage() {
  const session = await auth()
  const recentPosts = await getRecentPosts()
  const recentActivity = await getRecentActivity()
  
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="home-page">
      {/* Greeting */}
      <div className="home-greeting">
        <h1 className="home-greeting-text">
          {session ? `${greeting}, ${session.user.displayName || session.user.username}` : 'Welcome'}
        </h1>
        <p className="home-greeting-subtitle">
          {session ? 'Here's what's been happening' : 'A quiet space for thoughts and community'}
        </p>
      </div>

      {/* Recent Posts */}
      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Recent Posts</h2>
          <Link href="/posts" className="home-section-link">
            View all →
          </Link>
        </div>
        
        {recentPosts.length > 0 ? (
          <div className="home-feed">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.slug}`} className="home-card fade-in">
                <div className="home-card-header">
                  <h3 className="home-card-title">{post.title}</h3>
                  <time className="home-card-time">
                    {new Date(post.publishedAt!).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                {post.excerpt && (
                  <p className="home-card-excerpt">{post.excerpt}</p>
                )}
                <div className="home-card-footer">
                  <div className="home-card-author">
                    {post.author.avatarUrl ? (
                      <img src={post.author.avatarUrl} alt="" className="home-card-avatar" />
                    ) : (
                      <div className="home-card-avatar">
                        {(post.author.username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="home-card-author-name">
                      {post.author.displayName || post.author.username}
                    </span>
                  </div>
                  <div className="home-card-stats">
                    {post._count.reactions > 0 && (
                      <span className="home-card-stat">❤️ {post._count.reactions}</span>
                    )}
                    {post._count.comments > 0 && (
                      <span className="home-card-stat">💬 {post._count.comments}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="home-empty">
            <p>No posts yet. {session && <Link href="/editor/new">Write the first one?</Link>}</p>
          </div>
        )}
      </section>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <section className="home-section">
          <div className="home-section-header">
            <h2 className="home-section-title">Recent Activity</h2>
          </div>
          
          <div className="home-activity">
            {recentActivity.map((comment) => (
              <div key={comment.id} className="home-activity-item fade-in">
                <div className="home-activity-header">
                  <span className="home-activity-author">
                    {comment.author.displayName || comment.author.username}
                  </span>
                  <span className="home-activity-action">commented on</span>
                  <Link href={`/posts/${comment.post.slug}`} className="home-activity-post">
                    {comment.post.title}
                  </Link>
                </div>
                <p className="home-activity-preview">
                  {comment.content.length > 100
                    ? `${comment.content.substring(0, 100)}...`
                    : comment.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      {session && (
        <section className="home-section">
          <div className="home-actions">
            <Link href="/editor/new" className="home-action-btn btn-primary">
              ✎ Write a Post
            </Link>
            <Link href="/dashboard" className="home-action-btn btn-secondary">
              ◈ Dashboard
            </Link>
          </div>
        </section>
      )}

      {!session && (
        <section className="home-section">
          <div className="home-cta">
            <p className="home-cta-text">Ready to join?</p>
            <div className="home-actions">
              <Link href="/register" className="home-action-btn btn-primary">
                Create Account
              </Link>
              <Link href="/login" className="home-action-btn btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">Blog & Posts</h3>
              <p className="text-gray-600">
                Write and share your thoughts with markdown support, custom emojis,
                and media attachments
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">Comments & Reactions</h3>
              <p className="text-gray-600">
                Engage with threaded comments, reactions, and a vibrant community
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">🛠️</div>
              <h3 className="text-xl font-bold mb-2">Custom Tools</h3>
              <p className="text-gray-600">
                Access unique tools and utilities built specifically for this
                platform
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">😀</div>
              <h3 className="text-xl font-bold mb-2">Custom Emojis</h3>
              <p className="text-gray-600">
                Create and use your own custom emojis throughout the platform
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Privacy Controls</h3>
              <p className="text-gray-600">
                Control visibility with public, unlisted, and private post options
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-bold mb-2">Self-Hosted</h3>
              <p className="text-gray-600">
                Fully self-hosted solution with Docker for complete data ownership
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Explore the Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/about"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold mb-2">About</h3>
              <p className="text-gray-600">
                Learn more about me, my background, and the tech stack
              </p>
            </Link>

            <Link
              href="/projects"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold mb-2">Projects</h3>
              <p className="text-gray-600">
                Explore my portfolio and see what I've been building
              </p>
            </Link>

            <Link
              href="/tools"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold mb-2">Tools</h3>
              <p className="text-gray-600">
                Access useful tools and utilities for various tasks
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!session && (
        <section className="bg-blue-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Create an account and become part of the community
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Sign Up Now
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
