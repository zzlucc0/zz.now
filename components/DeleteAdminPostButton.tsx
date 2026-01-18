'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { ButtonProps } from '@/components/ui/button'

interface DeleteAdminPostButtonProps {
  postId: string
  postTitle: string
  variant?: ButtonProps['variant']
  className?: string
}

export function DeleteAdminPostButton({ 
  postId, 
  postTitle,
  variant = 'link',
  className = 'text-red-600 hover:underline text-sm p-0 h-auto'
}: DeleteAdminPostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete post "${postTitle}"? This cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        window.location.reload()
      } else {
        alert('Failed to delete post')
        setIsDeleting(false)
      }
    } catch (error) {
      alert('Error deleting post')
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
