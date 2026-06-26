import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/stores/useStore'
import type { Photo } from '@/types/photo'

interface ExpandedViewProps {
  photo: Photo
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}

export default function ExpandedView({ photo, onClose, onPrev, onNext, hasPrev, hasNext }: ExpandedViewProps) {
  const [note, setNote] = useState(photo.note)
  const [title, setTitle] = useState(photo.title)
  const [renaming, setRenaming] = useState(false)
  const [tempTitle, setTempTitle] = useState(photo.title)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateNote = useStore((s) => s.updateNote)
  const updatePhoto = useStore((s) => s.updatePhoto)

  // Reset state when photo changes
  useEffect(() => {
    setNote(photo.note)
    setTitle(photo.title)
    setTempTitle(photo.title)
  }, [photo.id, photo.note, photo.title])

  // Focus input when renaming
  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [renaming])

  // Auto-save note
  useEffect(() => {
    if (noteTimer.current) clearTimeout(noteTimer.current)
    noteTimer.current = setTimeout(async () => {
      if (note !== photo.note) {
        setSaving(true)
        await updateNote(photo.id, note)
        setSaving(false)
      }
    }, 500)
    return () => {
      if (noteTimer.current) clearTimeout(noteTimer.current)
    }
  }, [note, photo.id, photo.note, updateNote])

  // Auto-save title
  useEffect(() => {
    if (!renaming) return
    if (titleTimer.current) clearTimeout(titleTimer.current)
    titleTimer.current = setTimeout(async () => {
      if (tempTitle !== photo.title && tempTitle.trim()) {
        setSaving(true)
        await updatePhoto({ id: photo.id, title: tempTitle.trim() })
        setSaving(false)
      }
    }, 500)
    return () => {
      if (titleTimer.current) clearTimeout(titleTimer.current)
    }
  }, [tempTitle, renaming, photo.id, photo.title, updatePhoto])

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') setRenaming(false)
    if (e.key === 'Escape') { setTempTitle(photo.title); setRenaming(false) }
  }

  return (
    <>
      {/* Navigation arrows - placed at viewport level so they're never blocked */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div className="fixed inset-0 z-[100] flex items-stretch">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Main content area */}
        <div className="relative z-10 flex w-full h-full" onClick={(e) => e.stopPropagation()}>
          {/* LEFT: Large photo */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img
              src={photo.fullBase64}
              alt={photo.title}
              className="max-h-[85vh] max-w-[90%] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* RIGHT: Note & details */}
          <div className="w-80 bg-white flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">照片详情</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Title */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  照片名称
                </label>
                {renaming ? (
                  <input
                    ref={inputRef}
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={() => setRenaming(false)}
                    onKeyDown={handleTitleKeyDown}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    maxLength={50}
                  />
                ) : (
                  <div
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setRenaming(true)}
                  >
                    <span className="text-sm text-gray-700 font-medium truncate">{title}</span>
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Dimensions */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  尺寸
                </label>
                <p className="text-sm text-gray-600">{photo.width} × {photo.height}</p>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  备注
                </label>
                <div className="relative">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="添加备注..."
                    className="w-full h-40 resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    maxLength={500}
                  />
                  <div className="absolute bottom-2 right-3 flex items-center gap-2">
                    {saving && (
                      <span className="text-[10px] text-primary animate-pulse">保存中...</span>
                    )}
                    <span className="text-[10px] text-gray-300">{note.length}/500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
