'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import sanitizeHtml from 'sanitize-html'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  // Parse custom emoji syntax :emoji_<id>:
  const parseEmojis = (text: string) => {
    return text.replace(/:emoji_([a-zA-Z0-9]+):/g, (match, id) => {
      return `<img src="${
        process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '/api/media'
      }/emojis/${id}" alt="emoji" class="inline-block w-6 h-6" />`
    })
  }

  // Sanitize HTML to prevent XSS
  const sanitizedContent = sanitizeHtml(parseEmojis(content), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'pre',
      'code',
      'blockquote',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'video',
      'source',
      'iframe',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'class'],
      a: ['href', 'target', 'rel'],
      code: ['class'],
      pre: ['class'],
      video: ['src', 'controls', 'poster', 'width', 'height', 'class', 'muted', 'loop', 'playsinline'],
      source: ['src', 'type'],
      iframe: ['src', 'title', 'allow', 'allowfullscreen', 'width', 'height', 'frameborder', 'loading', 'class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  })

  return (
    <div
      className={`prose prose-lg max-w-none dark:prose-invert ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom heading styles
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl font-bold mb-4 mt-8" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl font-bold mb-3 mt-6" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-bold mb-2 mt-4" {...props} />
          ),

          // Code blocks
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              )
            }

            return (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            )
          },

          // Links with target blank for external
          a: ({ node, href, children, ...props }) => {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-blue-600 hover:underline"
                {...props}
              >
                {children}
              </a>
            )
          },

          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4"
              {...props}
            />
          ),

          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                className="min-w-full divide-y divide-gray-200 border"
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-4 py-2 bg-gray-100 text-left font-semibold"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 border-t" {...props} />
          ),

          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside my-4 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside my-4 space-y-2"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="text-gray-800" {...props} />
          ),

          // Images
          img: ({ node, ...props }) => (
            <img
              className="rounded-lg max-w-full h-auto my-4"
              loading="lazy"
              {...props}
            />
          ),

          video: ({ node, ...props }) => (
            <div className="my-4 overflow-hidden rounded-xl bg-black/70">
              <video
                controls
                className="post-video w-full"
                {...props}
              />
            </div>
          ),

          iframe: ({ node, ...props }) => (
            <div className="my-6 overflow-hidden rounded-xl bg-black/80">
              <iframe
                className="post-iframe h-[360px] w-full"
                loading="lazy"
                {...props}
              />
            </div>
          ),

          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="mb-4 text-gray-800 leading-relaxed" {...props} />
          ),
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  )
}
