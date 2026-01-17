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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Blog Posts</h1>
        <p className="text-gray-600">
          Thoughts, tutorials, and insights on software development
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2">Filter by Tag</label>
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={searchParams.tag || ''}
            onChange={(e) => {
              const url = new URL(window.location.href)
              if (e.target.value) {
                url.searchParams.set('tag', e.target.value)
              } else {
                url.searchParams.delete('tag')
              }
              url.searchParams.delete('page')
              window.location.href = url.toString()
            }}
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.slug}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Link
            href="/editor/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Write Post
          </Link>
        </div>
      </div>

      {/* Tag Pills */}
      {tags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/posts"
              className={`px-3 py-1 rounded-full text-sm ${
                !searchParams.tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              All
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/posts?tag=${tag.slug}`}
                className={`px-3 py-1 rounded-full text-sm ${
                  searchParams.tag === tag.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts found</p>
          <Link
            href="/editor/new"
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            Write the first post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link href={`/posts/${post.slug}`}>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 hover:text-blue-600">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
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
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/posts?page=${page - 1}${
                searchParams.tag ? `&tag=${searchParams.tag}` : ''
              }`}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Previous
            </Link>
          )}

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Link
                  key={pageNum}
                  href={`/posts?page=${pageNum}${
                    searchParams.tag ? `&tag=${searchParams.tag}` : ''
                  }`}
                  className={`px-4 py-2 border rounded-lg ${
                    pageNum === page
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            )}
          </div>

          {page < totalPages && (
            <Link
              href={`/posts?page=${page + 1}${
                searchParams.tag ? `&tag=${searchParams.tag}` : ''
              }`}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
