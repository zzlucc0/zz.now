'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { RichMarkdownEditor } from '@/components/editor/RichMarkdownEditor'

export default function NewPostPage() {
  const router = useRouter()
  const { status } = useSession()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [status_, setStatus_] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'UNLISTED' | 'PRIVATE'>('PUBLIC')
  const [loading, setLoading] = useState(false)
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; slug: string }>>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    // Fetch available tags
    fetch('/api/tags')
      .then((res) => res.json())
      .then((data) => setAvailableTags(data.tags || []))
      .catch(console.error)
  }, [])

  const handleMediaUpload = async (file: File, kind: 'image' | 'video') => {
    const purpose = kind === 'image' ? 'POST_IMAGE' : 'POST_VIDEO'

    const presignRes = await fetch('/api/media/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purpose,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      }),
    })

    if (!presignRes.ok) {
      const error = await presignRes.json()
      throw new Error(error.error || 'Failed to get upload URL')
    }

    const { uploadUrl, objectKey } = await presignRes.json()

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!uploadRes.ok) {
      throw new Error('Failed to upload file')
    }

    const confirmRes = await fetch('/api/media/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objectKey,
        purpose,
      }),
    })

    if (!confirmRes.ok) {
      const error = await confirmRes.json()
      throw new Error(error.error || 'Failed to confirm upload')
    }

    const data = await confirmRes.json()
    return data.url || data.publicUrl
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          excerpt: excerpt || undefined,
          tags,
          status: status_,
          visibility,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to create post')
      }

      const post = data.data?.post || data.post
      if (!post) {
        throw new Error('Post created but no data returned')
      }

      router.push(`/posts/${post.slug}`)
    } catch (error) {
      console.error('Create post error:', error)
      alert(error instanceof Error ? error.message : 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold mb-6">Create New Post</h1>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Enter post title..."
            required
          />
        </div>

        {/* Excerpt */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Excerpt (optional)
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Brief summary for post cards..."
            rows={2}
          />
        </div>

        {/* Content Editor */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Content</label>
          <RichMarkdownEditor
            value={content}
            onChange={setContent}
            onUploadMedia={handleMediaUpload}
          />
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
              placeholder="Add tags..."
              list="available-tags"
            />
            <datalist id="available-tags">
              {availableTags.map((tag) => (
                <option key={tag.id} value={tag.name} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={handleAddTag}
              className="home-action-btn btn-secondary"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="tag-pill text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status and Visibility */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={status_}
              onChange={(e) =>
                setStatus_(e.target.value as 'DRAFT' | 'PUBLISHED')
              }
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(
                  e.target.value as 'PUBLIC' | 'UNLISTED' | 'PRIVATE'
                )
              }
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="PUBLIC">Public</option>
              <option value="UNLISTED">Unlisted</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="home-action-btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="home-action-btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
