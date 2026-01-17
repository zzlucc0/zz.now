'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import MarkdownRenderer from './MarkdownRenderer'

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
  replies: Comment[]
}

interface CommentSectionProps {
  postId: string
}

function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  userId,
  isAdmin,
}: {
  comment: Comment
  onReply: (parentId: string) => void
  onEdit: (commentId: string, content: string) => void
  onDelete: (commentId: string) => void
  userId?: string
  isAdmin?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const isAuthor = comment.author.id === userId

  const handleSaveEdit = async () => {
    await onEdit(comment.id, editContent)
    setIsEditing(false)
  }

  return (
    <div className="mb-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.author.avatarUrl ? (
            <img
              src={comment.author.avatarUrl}
              alt={comment.author.displayName || comment.author.username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-bold">
                {(
                  comment.author.displayName || comment.author.username
                )[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <Link
                  href={`/users/${comment.author.id}`}
                  className="font-medium hover:text-blue-600"
                >
                  {comment.author.displayName || comment.author.username}
                </Link>
                <span className="text-sm text-gray-500 ml-2">
                  {new Date(comment.createdAt).toLocaleDateString()}
                  {comment.updatedAt !== comment.createdAt && ' (edited)'}
                </span>
              </div>

              {(isAuthor || isAdmin) && !isEditing && (
                <div className="flex gap-2">
                  {isAuthor && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (
                        confirm('Are you sure you want to delete this comment?')
                      ) {
                        onDelete(comment.id)
                      }
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg mb-2"
                  rows={4}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditContent(comment.content)
                      setIsEditing(false)
                    }}
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-800 prose prose-sm max-w-none">
                <MarkdownRenderer content={comment.content} />
              </div>
            )}
          </div>

          {/* Reply Button */}
          {!isEditing && (
            <button
              onClick={() => onReply(comment.id)}
              className="text-sm text-blue-600 hover:underline mt-2"
            >
              Reply
            </button>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 ml-4 border-l-2 border-gray-200 pl-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  userId={userId}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !session) return

    setLoading(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: newComment,
          parentId: replyToId,
        }),
      })

      if (res.ok) {
        setNewComment('')
        setReplyToId(null)
        await fetchComments()
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        await fetchComments()
      }
    } catch (error) {
      console.error('Failed to edit comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchComments()
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Please login to comment</p>
        <Link
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Login
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex gap-3">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
              <span className="text-sm font-bold">
                {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1">
            {replyToId && (
              <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  Replying to comment
                </span>
                <button
                  type="button"
                  onClick={() => setReplyToId(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </div>
            )}

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment... (Markdown supported)"
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              disabled={loading}
            />

            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Markdown supported. Use :emoji_id: for custom emojis.
              </p>
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting...' : replyToId ? 'Reply' : 'Comment'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div>
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={setReplyToId}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              userId={session.user.id}
              isAdmin={session.user.role === 'ADMIN'}
            />
          ))
        )}
      </div>
    </div>
  )
}
