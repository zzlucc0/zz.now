'use client'

import { useRef, useState } from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link2,
  Code,
  Minus,
  Image as ImageIcon,
  Video,
  Music,
  Eye,
  EyeOff,
  Type,
} from 'lucide-react'
import MarkdownRenderer from '@/components/MarkdownRenderer'

type UploadKind = 'image' | 'video' | 'audio'

interface RichMarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onUploadMedia?: (file: File, kind: UploadKind) => Promise<string>
}

const toolbarButtonBase =
  'inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-xs font-medium text-muted-foreground transition hover:text-foreground hover:border-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

export function RichMarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your post content... (Markdown supported)',
  onUploadMedia,
}: RichMarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [uploadingKind, setUploadingKind] = useState<UploadKind | null>(null)

  const withTextarea = (
    callback: (textarea: HTMLTextAreaElement, start: number, end: number) => void
  ) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? value.length
    callback(textarea, start, end)
  }

  const wrapSelection = (before: string, after = before, placeholderText = 'text') => {
    withTextarea((textarea, start, end) => {
      const selected = value.slice(start, end) || placeholderText
      const nextValue =
        value.slice(0, start) + before + selected + after + value.slice(end)
      onChange(nextValue)

      queueMicrotask(() => {
        textarea.focus()
        const selectionStart = start + before.length
        const selectionEnd = selectionStart + selected.length
        textarea.setSelectionRange(selectionStart, selectionEnd)
      })
    })
  }

  const applyLinePrefix = (prefix: string, placeholderText = 'Text') => {
    withTextarea((textarea, start, end) => {
      const selected = value.slice(start, end)
      const content = selected || placeholderText
      const lines = content.split('\n')
      const prefixed = lines
        .map((line) => {
          const trimmed = line.trim()
          return trimmed.startsWith(prefix.trim()) ? line : `${prefix}${line || placeholderText}`
        })
        .join('\n')

      const nextValue = value.slice(0, start) + prefixed + value.slice(end)
      onChange(nextValue)

      queueMicrotask(() => {
        textarea.focus()
        textarea.setSelectionRange(start, start + prefixed.length)
      })
    })
  }

  const insertBlock = (block: string) => {
    withTextarea((textarea, start, end) => {
      const before = value.slice(0, start)
      const after = value.slice(end)
      const nextValue = `${before}${block}${after}`
      onChange(nextValue)

      queueMicrotask(() => {
        const cursor = start + block.length
        textarea.focus()
        textarea.setSelectionRange(cursor, cursor)
      })
    })
  }

  const handleLink = () => {
    const url = window.prompt('Enter URL (https://...)')?.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) {
      window.alert('Please enter a valid absolute URL.')
      return
    }
    wrapSelection('[', `](${url})`, 'link text')
  }

  const handleImageUrl = () => {
    const url = window.prompt('Enter image URL (https://...)')?.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) {
      window.alert('Please enter a valid image URL.')
      return
    }
    insertBlock(`\n\n![Image](${url})\n\n`)
  }

  const handleEmbedVideo = () => {
    const url = window.prompt('Enter video embed or iframe URL (https://...)')?.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) {
      window.alert('Please enter a valid URL.')
      return
    }
    const iframe = `\n\n<iframe src="${url}" title="Embedded video" loading="lazy" allowfullscreen class="post-iframe" frameborder="0"></iframe>\n\n`
    insertBlock(iframe)
  }

  const handleFileUpload = async (kind: UploadKind, file?: File | null) => {
    if (!file || !onUploadMedia) return

    setUploadingKind(kind)
    try {
      const url = await onUploadMedia(file, kind)
      if (!url) {
        window.alert('Upload failed. No URL returned.')
        return
      }

      if (kind === 'image') {
        insertBlock(`\n\n![${file.name}](${url})\n\n`)
      } else if (kind === 'video') {
        const videoBlock = `\n\n<video controls class="post-video">\n  <source src="${url}" type="${file.type}" />\n  Your browser does not support the video tag.\n</video>\n\n`
        insertBlock(videoBlock)
      } else if (kind === 'audio') {
        const audioBlock = `\n\n<audio controls class="post-audio">\n  <source src="${url}" type="${file.type}" />\n  Your browser does not support the audio tag.\n</audio>\n\n`
        insertBlock(audioBlock)
      }
    } catch (error) {
      console.error('Media upload failed:', error)
      window.alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploadingKind(null)
      if (imageInputRef.current) imageInputRef.current.value = ''
      if (videoInputRef.current) videoInputRef.current.value = ''
      if (audioInputRef.current) audioInputRef.current.value = ''
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 bg-muted/30">
        <button
          type="button"
          className={toolbarButtonBase}
          aria-label="Heading 1"
          onClick={() => applyLinePrefix('# ')}
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarButtonBase}
          aria-label="Heading 2"
          onClick={() => applyLinePrefix('## ')}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarButtonBase}
          aria-label="Heading 3"
          onClick={() => applyLinePrefix('### ')}
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <button type="button" className={toolbarButtonBase} aria-label="Bold" onClick={() => wrapSelection('**', '**', 'bold text')}>
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonBase} aria-label="Italic" onClick={() => wrapSelection('*', '*', 'italic text')}>
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonBase} aria-label="Strikethrough" onClick={() => wrapSelection('~~', '~~', 'strikethrough text')}>
          <Strikethrough className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonBase} aria-label="Inline code" onClick={() => wrapSelection('`', '`', 'code')}>
          <Code className="h-4 w-4" />
        </button>
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <button type="button" className={toolbarButtonBase} aria-label="Quote" onClick={() => applyLinePrefix('> ', 'Quote')}>
          <Quote className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonBase} aria-label="Bullet list" onClick={() => applyLinePrefix('- ', 'List item')}>
          <List className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonBase} aria-label="Numbered list" onClick={() => applyLinePrefix('1. ', 'List item')}>
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonBase} aria-label="Divider" onClick={() => insertBlock('\n\n---\n\n')}>
          <Minus className="h-4 w-4" />
        </button>
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <button type="button" className={toolbarButtonBase} aria-label="Insert link" onClick={handleLink}>
          <Link2 className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonBase} aria-label="Insert image via URL" onClick={handleImageUrl}>
          <ImageIcon className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonBase} aria-label="Embed video" onClick={handleEmbedVideo}>
          <Video className="h-4 w-4" />
        </button>
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <button
          type="button"
          className={`${toolbarButtonBase} ${mode === 'preview' ? 'bg-primary/10 text-primary' : ''}`}
          aria-label={mode === 'preview' ? 'Switch to edit' : 'Switch to preview'}
          onClick={() => setMode(mode === 'preview' ? 'edit' : 'preview')}
        >
          {mode === 'preview' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Type className="h-3.5 w-3.5" />
          Markdown & formatting supported
        </span>
      </div>

      <div className="border-b border-border bg-background px-4 py-3">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="home-action-btn btn-secondary"
            onClick={() => imageInputRef.current?.click()}
            disabled={!onUploadMedia || uploadingKind === 'image'}
          >
            {uploadingKind === 'image' ? 'Uploading image...' : 'Upload Image'}
          </button>
          <button
            type="button"
            className="home-action-btn btn-secondary"
            onClick={() => videoInputRef.current?.click()}
            disabled={!onUploadMedia || uploadingKind === 'video'}
          >
            {uploadingKind === 'video' ? 'Uploading video...' : 'Upload Video'}
          </button>
          <button
            type="button"
            className="home-action-btn btn-secondary"
            onClick={() => audioInputRef.current?.click()}
            disabled={!onUploadMedia || uploadingKind === 'audio'}
          >
            {uploadingKind === 'audio' ? 'Uploading audio...' : 'Upload Audio'}
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFileUpload('image', event.target.files?.[0] ?? null)}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(event) => handleFileUpload('video', event.target.files?.[0] ?? null)}
          />
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(event) => handleFileUpload('audio', event.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      {mode === 'preview' ? (
        <div className="min-h-[400px] border-border bg-secondary/20 px-4 py-6">
          <MarkdownRenderer content={value} />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-[400px] w-full resize-none border-0 bg-transparent px-4 py-4 font-mono text-base text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
        />
      )}

      <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        Use emoji shortcodes (:emoji_id:), fenced code blocks, and the toolbar above for quick formatting. Uploaded media is automatically embedded into your Markdown.
      </p>
    </div>
  )
}

export type { UploadKind }
