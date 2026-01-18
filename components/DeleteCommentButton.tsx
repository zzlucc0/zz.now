'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { ButtonProps } from '@/components/ui/button'

interface DeleteCommentButtonProps {
  commentId: string
  variant?: ButtonProps['variant']
  className?: string
}

export function DeleteCommentButton({ 
  commentId,
  variant = 'link',
  className = 'text-red-600 hover:underline text-sm p-0 h-auto'
}: DeleteCommentButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this comment? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        window.location.reload()
      } else {
        alert('Failed to delete comment')
        setIsDeleting(false)
      }
    } catch (error) {
      alert('Error deleting comment')
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleDelete}
      disabled={isDeleting}
      className={className}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  )
}
