'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { ButtonProps } from '@/components/ui/button'

interface DeletePostButtonProps {
  postSlug: string
  variant?: ButtonProps['variant']
  className?: string
  onSuccess?: () => void
}

export function DeletePostButton({ 
  postSlug, 
  variant = 'destructive',
  className,
  onSuccess 
}: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/posts/${postSlug}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        if (onSuccess) {
          onSuccess()
        } else {
          window.location.href = '/posts'
        }
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
