'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { RichMarkdownEditor } from '@/components/editor/RichMarkdownEditor'

interface PageProps {
  params: { postId: string }
}

export default function EditPostPage({ params }: PageProps) {
  const router = useRouter()
  const { status } = useSession()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [status_, setStatus_] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'UNLISTED' | 'PRIVATE'>('PUBLIC')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [postSlug, setPostSlug] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      loadPost()
    }
  }, [status, params.postId])

  useEffect(() => {
    // Fetch available tags
    fetch('/api/tags')
      .then((res) => res.json())
      .then((data) => setAvailableTags(data.tags || []))
      .catch(console.error)
  }, [])

  const loadPost = async () => {
    try {
      const res = await fetch(`/api/posts/${params.postId}`)
      if (!res.ok) {
        if (res.status === 404) {
          alert('Post not found')
          router.push('/posts')
        } else if (res.status === 403) {
          alert('You do not have permission to edit this post')
          router.push('/posts')
        }
        return
      }

      const { post } = await res.json()
      setTitle(post.title)
      setContent(post.content)
      setExcerpt(post.excerpt || '')
      setTags(post.tags.map((t: any) => t.name))
      setStatus_(post.status)
      setVisibility(post.visibility)
      setPostSlug(post.slug)
    } catch (error) {
      console.error('Failed to load post:', error)
      alert('Failed to load post')
      router.push('/posts')
    } finally {
      setLoading(false)
    }
  }

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
      headers: { 'Content-Type': file.type },
    })

    if (!uploadRes.ok) {
      throw new Error('Failed to upload file')
    }

    const confirmRes = await fetch('/api/media/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objectKey, purpose }),
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

    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${postSlug}`, {
        method: 'PATCH',
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

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update post')
      }

      const { post } = await res.json()
      router.push(`/posts/${post.slug}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update post')
    } finally {
      setSaving(false)
    }
  }

  if (loading || status === 'loading') {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold mb-6">Edit Post</h1>

      <form onSubmit={handleSubmit}>
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

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Content</label>
          <RichMarkdownEditor
            value={content}
            onChange={setContent}
            onUploadMedia={handleMediaUpload}
          />
        </div>

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

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={status_}
              onChange={(e) => setStatus_(e.target.value as any)}
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
              onChange={(e) => setVisibility(e.target.value as any)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="PUBLIC">Public</option>
              <option value="UNLISTED">Unlisted</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="home-action-btn btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/posts/${postSlug}`)}
            className="home-action-btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
