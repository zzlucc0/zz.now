'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function NewPostPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [status_, setStatus_] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'UNLISTED' | 'PRIVATE'>('PUBLIC')
  const [isPreview, setIsPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // 1. Request presigned URL
      const presignRes = await fetch('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: 'POST_IMAGE',
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        }),
      })

      if (!presignRes.ok) {
        const error = await presignRes.json()
        throw new Error(error.error || 'Failed to get upload URL')
      }

      const { uploadUrl, publicUrl, objectKey } = await presignRes.json()

      // 2. Upload to MinIO
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

      // 3. Confirm upload
      const confirmRes = await fetch('/api/media/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectKey,
          purpose: 'POST_IMAGE',
        }),
      })

      if (!confirmRes.ok) {
        throw new Error('Failed to confirm upload')
      }

      // Insert markdown image syntax at cursor
      setContent((prev) => prev + `\n\n![Image](${publicUrl})\n\n`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
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

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create post')
      }

      const { post } = await res.json()
      router.push(`/posts/${post.slug}`)
    } catch (error) {
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
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief summary for post cards..."
            rows={2}
          />
        </div>

        {/* Content Editor */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Content</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isPreview ? 'Edit' : 'Preview'}
              </button>
              <label className="text-sm text-blue-600 hover:underline cursor-pointer">
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {isPreview ? (
            <div className="border rounded-lg p-4 min-h-[400px] bg-white">
              <MarkdownRenderer content={content} />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="Write your post content... (Markdown supported)"
              rows={20}
              required
            />
          )}
          <p className="text-xs text-gray-500 mt-1">
            Markdown supported. Use :emoji_id: for custom emojis.
          </p>
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
              className="flex-1 px-4 py-2 border rounded-lg"
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
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-red-600 hover:text-red-800"
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
              onChange={(e) => setStatus_(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg"
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
              className="w-full px-4 py-2 border rounded-lg"
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
