import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/stores/useStore'
import type { Photo } from '@/types/photo'

interface PhotoCardProps {
  photo: Photo
}

export default function PhotoCard({ photo }: PhotoCardProps) {
  const [saving, setSaving] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [tempTitle, setTempTitle] = useState(photo.title)
  const [hovering, setHovering] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const updatePhoto = useStore((s) => s.updatePhoto)
  const deletePhoto = useStore((s) => s.deletePhoto)
  const openLightbox = useStore((s) => s.openLightbox)
  const openExpandedView = useStore((s) => s.openExpandedView)
  const expandedPhotoId = useStore((s) => s.expandedPhotoId)
  const toggleSelect = useStore((s) => s.togglePhotoSelection)
  const isSelected = useStore((s) => s.selectedPhotos.includes(photo.id))
  const isSelectMode = useStore((s) => s.isSelectMode)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const isExpanded = expandedPhotoId === photo.id

  // Close expanded view when hovering over a card
  useEffect(() => {
    if (hovering) {
      // expanded view will be closed by click anyway
    }
  }, [hovering])

  // Reset temp title when photo changes
  useEffect(() => {
    setTempTitle(photo.title)
  }, [photo.title])

  // Focus input when renaming starts
  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [renaming])

  // Auto-save title with debounce
  useEffect(() => {
    if (!renaming) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      if (tempTitle !== photo.title && tempTitle.trim()) {
        setSaving(true)
        await updatePhoto({ id: photo.id, title: tempTitle.trim() })
        setSaving(false)
      }
    }, 500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [tempTitle, photo.title, photo.id, renaming, updatePhoto])

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') {
      return
    }
    if (isSelectMode) {
      toggleSelect(photo.id)
    } else if (isExpanded) {
      // do nothing
    } else {
      openExpandedView(photo.id)
    }
  }

  const handleImageClick = () => {
    if (!isSelectMode) {
      openLightbox(photo.id)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') setRenaming(false)
    if (e.key === 'Escape') { setTempTitle(photo.title); setRenaming(false) }
  }

  return (
    <div
      className={`relative transition-all duration-300 ${
        isExpanded ? 'ring-2 ring-primary rounded-xl shadow-lg' : ''
      }`}
    >
      {/* Selection checkbox */}
      {isSelectMode && (
        <div className="absolute top-2 left-2 z-20">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelect(photo.id)}
            className="w-5 h-5 rounded border-gray-300 text-primary cursor-pointer accent-indigo-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Fixed-height card container */}
      <div
        className="relative w-full rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-200 bg-white group"
        style={{ height: '220px' }}
        onClick={handleCardClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Photo */}
        <img
          src={photo.thumbnailBase64}
          alt={photo.title}
          className="w-full h-full object-cover"
          onClick={(e) => {
            e.stopPropagation()
            handleImageClick()
          }}
        />

        {/* Dark gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Title bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {renaming ? (
            <input
              ref={inputRef}
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={() => setRenaming(false)}
              className="w-full bg-white/90 text-white text-xs font-medium px-2 py-1 rounded border border-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
              maxLength={50}
            />
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-medium truncate pr-2 drop-shadow">
                {photo.title}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {saving && (
                  <span className="text-[9px] text-white/70 animate-pulse">保存中...</span>
                )}
                {/* Rename button */}
                <button
                  className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setRenaming(true)
                  }}
                  title="重命名"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {/* Delete button */}
                <button
                  className="w-5 h-5 rounded-full bg-white/20 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDeleteConfirm(true)
                  }}
                  title="删除"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Note indicator */}
        {photo.note && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            📝
          </div>
        )}
      </div>

      {/* Delete confirmation mini-modal */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 z-30 rounded-xl bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-3 animate-modal-enter"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-8 h-8 text-red-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <p className="text-xs font-medium text-gray-700 mb-2 text-center leading-tight">删除这张照片？</p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-[11px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteConfirm(false)
              }}
            >
              取消
            </button>
            <button
              className="px-3 py-1 text-[11px] font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
              onClick={async (e) => {
                e.stopPropagation()
                setShowDeleteConfirm(false)
                await deletePhoto(photo.id)
              }}
            >
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
