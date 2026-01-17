'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Reaction {
  id: string
  type: string
  user: {
    id: string
    username: string
  }
}

interface ReactionButtonsProps {
  postId: string
  reactions: Reaction[]
}

const reactionEmojis = {
  LIKE: '👍',
  LOVE: '❤️',
  LAUGH: '😄',
  THINKING: '🤔',
}

export default function ReactionButtons({
  postId,
  reactions: initialReactions,
}: ReactionButtonsProps) {
  const { data: session } = useSession()
  const [reactions, setReactions] = useState(initialReactions)
  const [loading, setLoading] = useState(false)

  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const userReactions = reactions
    .filter((r) => r.user.id === session?.user?.id)
    .map((r) => r.type)

  const handleReaction = async (type: string) => {
    if (!session) {
      alert('Please login to react')
      return
    }

    setLoading(true)
    try {
      // Check if user already reacted with this type
      const hasReacted = userReactions.includes(type)

      if (hasReacted) {
        // Remove reaction
        const reactionId = reactions.find(
          (r) => r.user.id === session.user.id && r.type === type
        )?.id

        const res = await fetch(`/api/reactions/${reactionId}`, {
          method: 'DELETE',
        })

        if (res.ok) {
          setReactions(reactions.filter((r) => r.id !== reactionId))
        }
      } else {
        // Add reaction
        const res = await fetch('/api/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, type }),
        })

        if (res.ok) {
          const newReaction = await res.json()
          setReactions([...reactions, newReaction])
        }
      }
    } catch (error) {
      console.error('Failed to update reaction:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(reactionEmojis).map(([type, emoji]) => {
        const count = reactionCounts[type] || 0
        const hasReacted = userReactions.includes(type)

        return (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
              hasReacted
                ? 'bg-blue-100 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-xl">{emoji}</span>
            {count > 0 && <span className="font-medium">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
