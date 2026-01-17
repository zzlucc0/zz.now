'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Emoji {
  id: string
  name: string
  keywords: string
  url: string
  createdAt: string
}

export default function EmojiSettingsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editKeywords, setEditKeywords] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      loadEmojis()
    }
  }, [status])

  const loadEmojis = async () => {
    try {
      const res = await fetch('/api/emojis')
      if (res.ok) {
        const { emojis: emojiList } = await res.json()
        setEmojis(emojiList)
      }
    } catch (error) {
      console.error('Failed to load emojis:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const name = prompt('Enter emoji name (e.g., "happy_face"):')
    if (!name) return

    setUploading(true)
    try {
      // 1. Request presigned URL
      const presignRes = await fetch('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: 'EMOJI',
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

      // 2. Upload to MinIO
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
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
          purpose: 'EMOJI',
          name,
        }),
      })

      if (!confirmRes.ok) {
        const error = await confirmRes.json()
        throw new Error(error.error || 'Failed to confirm upload')
      }

      await loadEmojis()
      alert('Emoji uploaded successfully!')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleEdit = (emoji: Emoji) => {
    setEditingId(emoji.id)
    setEditName(emoji.name)
    setEditKeywords(emoji.keywords || '')
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/emojis/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          keywords: editKeywords || undefined,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update emoji')
      }

      await loadEmojis()
      setEditingId(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update emoji')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete emoji "${name}"? This cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/emojis/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete emoji')
      }

      await loadEmojis()
      alert('Emoji deleted successfully!')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete emoji')
    }
  }

  if (loading || status === 'loading') {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Dashboard
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">Emoji Management</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Custom Emojis</h1>
          <p className="text-gray-600">
            Upload and manage your custom emojis. Use them in posts and comments
            with :emoji_id: syntax.
          </p>
        </div>

        <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
          {uploading ? 'Uploading...' : '+ Upload Emoji'}
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload emoji images (PNG, JPG, WebP, GIF - max 5MB)</li>
          <li>
            • Use in posts/comments: <code className="bg-blue-100 px-1 rounded">:emoji_id:</code>
          </li>
          <li>• Add keywords to make emojis searchable</li>
          <li>• Each emoji must have a unique name</li>
        </ul>
      </div>

      {/* Emoji Grid */}
      {emojis.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">
            You don't have any custom emojis yet
          </p>
          <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
            Upload Your First Emoji
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emojis.map((emoji) => (
            <div
              key={emoji.id}
              className="bg-white border rounded-lg p-4 hover:shadow transition-shadow"
            >
              {editingId === emoji.id ? (
                // Edit Mode
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={emoji.url}
                      alt={emoji.name}
                      className="w-12 h-12 object-contain"
                    />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                      placeholder="Name"
                    />
                  </div>
                  <input
                    type="text"
                    value={editKeywords}
                    onChange={(e) => setEditKeywords(e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm mb-3"
                    placeholder="Keywords (comma-separated)"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(emoji.id)}
                      className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 px-3 py-1 border text-sm rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={emoji.url}
                        alt={emoji.name}
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <p className="font-medium">{emoji.name}</p>
                        <p className="text-xs text-gray-500">
                          :{emoji.id.slice(-8)}:
                        </p>
                      </div>
                    </div>
                  </div>

                  {emoji.keywords && (
                    <p className="text-sm text-gray-600 mb-3">
                      🏷️ {emoji.keywords}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(emoji)}
                      className="flex-1 px-3 py-1 text-sm border rounded hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(emoji.id, emoji.name)}
                      className="flex-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Added {new Date(emoji.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
