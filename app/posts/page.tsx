import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@/lib/db/prisma'
import type { PostStatus, Visibility } from '@prisma/client'

interface SearchParams {
  page?: string
  tag?: string
  author?: string
  status?: string
}

async function getPosts(params: SearchParams) {
  const page = parseInt(params.page || '1')
  const pageSize = 12
  const skip = (page - 1) * pageSize

  const where: any = {
    status: 'PUBLISHED' as PostStatus,
    visibility: 'PUBLIC' as Visibility,
  }

  if (params.tag) {
    where.tags = {
      some: {
        slug: params.tag,
      },
    }
  }

  if (params.author) {
    where.author = {
      username: params.author,
    }
  }

  const [posts, total, tags] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: pageSize,
      skip,
    }),
    prisma.post.count({ where }),
    prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    }),
  ])

  return {
    posts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    tags,
  }
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { posts, page, totalPages, tags } = await getPosts(searchParams)
  const selectedTag = searchParams.tag

  return (
    <div className="posts-page">
      {/* Header */}
      <div className="posts-header">
        <h1 className="posts-title">Posts</h1>
        <p className="posts-subtitle">Thoughts and writings</p>
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div className="posts-tags">
          <Link
            href="/posts"
            className={`posts-tag ${!selectedTag ? 'posts-tag-active' : ''}`}
          >
            All
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/posts?tag=${tag.slug}`}
              className={`posts-tag ${selectedTag === tag.slug ? 'posts-tag-active' : ''}`}
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="posts-empty">
          <p>No posts yet</p>
        </div>
      ) : (
        <div className="posts-feed">
          {posts.map((post, index) => (
            <article
              key={post.id}
              className="post-card fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Link href={`/posts/${post.slug}`} className="post-card-link">
                <div className="post-card-header">
                  <h2 className="post-card-title">{post.title}</h2>
                  <time className="post-card-date">
                    {new Date(post.publishedAt!).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>

                {post.excerpt && (
                  <p className="post-card-excerpt">{post.excerpt}</p>
                )}

                {post.tags.length > 0 && (
                  <div className="post-card-tags">
                    {post.tags.map((tag) => (
                      <span key={tag.id} className="post-card-tag">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="post-card-footer">
                  <div className="post-card-author">
                    {post.author.avatarUrl ? (
                      <img src={post.author.avatarUrl} alt="" className="post-card-avatar" />
                    ) : (
                      <div className="post-card-avatar">
                        {(post.author.username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="post-card-author-name">
                      {post.author.displayName || post.author.username}
                    </span>
                  </div>
                  <div className="post-card-stats">
                    {post._count.reactions > 0 && (
                      <span className="post-card-stat">❤️ {post._count.reactions}</span>
                    )}
                    {post._count.comments > 0 && (
                      <span className="post-card-stat">💬 {post._count.comments}</span>
                    )}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

                  <div className="flex items-center mb-4">
                    {post.author.avatarUrl ? (
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.displayName || post.author.username}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {(
                            post.author.displayName || post.author.username
                          )[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {post.author.displayName || post.author.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.publishedAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 bg-gray-100 text-xs rounded"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <span>💬 {post._count.comments}</span>
                    <span>❤️ {post._count.reactions}</span>
                  </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="posts-pagination">
          {page > 1 && (
            <Link
              href={`/posts?page=${page - 1}${selectedTag ? `&tag=${selectedTag}` : ''}`}
              className="posts-pagination-btn"
            >
              ← Previous
            </Link>
          )}

          <div className="posts-pagination-pages">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum
              if (totalPages <= 7) {
                pageNum = i + 1
              } else if (page <= 4) {
                pageNum = i + 1
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i
              } else {
                pageNum = page - 3 + i
              }
              
              return (
                <Link
                  key={pageNum}
                  href={`/posts?page=${pageNum}${selectedTag ? `&tag=${selectedTag}` : ''}`}
                  className={`posts-pagination-num ${pageNum === page ? 'posts-pagination-num-active' : ''}`}
                >
                  {pageNum}
                </Link>
              )
            })}
          </div>

          {page < totalPages && (
            <Link
              href={`/posts?page=${page + 1}${selectedTag ? `&tag=${selectedTag}` : ''}`}
              className="posts-pagination-btn"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
