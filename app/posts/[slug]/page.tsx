import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/config'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import CommentSection from '@/components/CommentSection'
import ReactionButtons from '@/components/ReactionButtons'
import { DeletePostButton } from '@/components/DeletePostButton'
import { AudioPlayer } from '@/components/AudioPlayer'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      media: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      reactions: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
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

  if (!post) {
    notFound()
  }

  return post
}

export default async function PostDetailPage({ params }: PageProps) {
  const session = await auth()
  const { slug } = await params
  const post = await getPost(slug)

  // Check visibility permissions
  if (post.visibility === 'PRIVATE' && post.authorId !== session?.user?.id) {
    notFound()
  }

  if (post.status !== 'PUBLISHED' && post.authorId !== session?.user?.id) {
    notFound()
  }

  const isAuthor = session?.user?.id === post.authorId
  const isAdmin = session?.user?.role === 'ADMIN'

  // Separate background music from other media
  const backgroundMusic = post.media.find((m) => m.type === 'AUDIO' && m.isBackgroundMusic)
  const otherMedia = post.media.filter((m) => !(m.type === 'AUDIO' && m.isBackgroundMusic))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Background Music Player */}
      {backgroundMusic && backgroundMusic.objectKey && (
        <div className="mb-6">
          <AudioPlayer
            src={`/api/media/${backgroundMusic.objectKey}`}
            title="Background Music"
            autoPlay={true}
          />
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link href="/posts" className="text-primary hover:underline">
          Posts
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="text-muted-foreground">{post.title}</span>
      </nav>

      {/* Status Badge for Drafts */}
      {post.status !== 'PUBLISHED' && (
        <div className="mb-4 p-3 bg-secondary border border-border rounded-lg">
          <p className="text-foreground text-sm">
            📝 This post is a <strong>{post.status.toLowerCase()}</strong> and
            only visible to you.
          </p>
        </div>
      )}

      {/* Post Header */}
      <article className="mb-8">
        <header className="mb-6">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.displayName || post.author.username}
                  className="w-12 h-12 rounded-full mr-3"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted border border-border mr-3 flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {(
                      post.author.displayName || post.author.username
                    )[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <Link
                  href={`/users/${post.author.id}`}
                  className="text-lg font-medium hover:text-primary"
                >
                  {post.author.displayName || post.author.username}
                </Link>
                <p className="text-sm text-muted-foreground">
                  Published{' '}
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Never'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {(isAuthor || isAdmin) && (
              <div className="flex gap-2">
                {isAuthor && (
                  <Link
                    href={`/editor/${post.id}`}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                  >
                    Edit
                  </Link>
                )}
                {(isAuthor || isAdmin) && (
                  <DeletePostButton postSlug={post.slug} />
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/posts?tag=${tag.slug}`}
                  className="tag-pill"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Post Content */}
        <div className="prose prose-lg max-w-none mb-8">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Attachments */}
        {otherMedia.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Attachments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherMedia.map((media) => (
                <div key={media.id} className="border border-border rounded-lg overflow-hidden">
                  {media.type === 'IMAGE' && media.objectKey && (
                    <img
                      src={`/api/media/${media.objectKey}`}
                      alt="Post media"
                      className="w-full h-auto"
                    />
                  )}
                  {media.type === 'VIDEO_EMBED' && media.embedUrl && (
                    <div className="aspect-video">
                      <iframe
                        src={media.embedUrl}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {media.type === 'AUDIO' && media.objectKey && (
                    <AudioPlayer
                      src={`/api/media/${media.objectKey}`}
                      title="Audio Attachment"
                      autoPlay={false}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reactions */}
        <div className="mt-8 pt-6 border-t border-border">
          <ReactionButtons postId={post.id} reactions={post.reactions} />
        </div>
      </article>

      {/* Comments Section */}
      <section className="border-t border-border pt-8">
        <h2 className="text-2xl font-bold mb-6">
          Comments ({post._count.comments})
        </h2>
        <CommentSection postId={post.id} />
      </section>

      {/* Author Bio */}
      {post.author.bio && (
        <aside className="mt-8 p-6 bg-secondary border border-border rounded-lg">
          <h3 className="text-lg font-bold mb-2">About the Author</h3>
          <div className="flex items-start gap-4">
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.displayName || post.author.username}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center">
                <span className="text-xl font-bold">
                  {(
                    post.author.displayName || post.author.username
                  )[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <Link
                href={`/users/${post.author.id}`}
                className="text-lg font-medium hover:text-primary"
              >
                {post.author.displayName || post.author.username}
              </Link>
              <p className="text-muted-foreground mt-1">{post.author.bio}</p>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
