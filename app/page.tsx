import Link from 'next/link'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { ClientGreeting } from '@/components/ClientGreeting'

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
  
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-hero-eyebrow">Personal platform</p>
          <h1 className="home-hero-title">
            {session ? (
              <ClientGreeting user={{
                displayName: (session.user as any).displayName,
                username: session.user.username,
              }} />
            ) : (
              'Welcome'
            )}
          </h1>
          <p className="home-hero-subtitle">
            {session ? "Here's what's been happening" : 'A quiet space for thoughts and community'}
          </p>
        </div>
        <div className="home-hero-actions">
          {session ? (
            <>
              <Link href="/editor/new" className="home-action-btn btn-primary">
                ✎ Write a Post
              </Link>
              <Link href="/dashboard" className="home-action-btn btn-secondary">
                ◈ Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/register" className="home-action-btn btn-primary">
                Create Account
              </Link>
              <Link href="/login" className="home-action-btn btn-secondary">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

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
            {recentPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className={`home-card fade-in ${index === 0 ? 'home-card-featured' : ''}`}
              >
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
    </div>
  )
}
