import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/stores/useStore'
import { usePhotos } from '@/hooks/usePhotos'

export default function LightboxModal() {
  const lightboxPhotoId = useStore((s) => s.lightboxPhotoId)
  const closeLightbox = useStore((s) => s.closeLightbox)
  const openLightbox = useStore((s) => s.openLightbox)
  const closeExpandedView = useStore((s) => s.closeExpandedView)
  const { albumPhotos } = usePhotos()

  // Close expanded view when lightbox opens
  useEffect(() => {
    if (lightboxPhotoId) {
      closeExpandedView()
    }
  }, [lightboxPhotoId, closeExpandedView])

  // Track current index for smooth transitions
  const [displayIndex, setDisplayIndex] = useState(0)
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left')

  // Reset display when lightbox opens
  useEffect(() => {
    if (lightboxPhotoId && currentIndex !== -1) {
      setDisplayIndex(currentIndex)
    }
  }, [lightboxPhotoId])

  if (!lightboxPhotoId) return null

  const currentIndex = albumPhotos.findIndex((p) => p.id === lightboxPhotoId)
  if (currentIndex === -1) return null

  const photo = albumPhotos[currentIndex]
  const prevPhoto = currentIndex > 0 ? albumPhotos[currentIndex - 1] : null
  const nextPhoto = currentIndex < albumPhotos.length - 1 ? albumPhotos[currentIndex + 1] : null

  // Compute slide direction
  const getSlideDirection = useCallback((targetIdx: number) => {
    if (targetIdx === displayIndex) return null
    return targetIdx > displayIndex ? 'left' : 'right'
  }, [displayIndex])

  const navigate = (dir: 'prev' | 'next') => {
    const target = dir === 'prev' ? prevPhoto : nextPhoto
    if (!target) return

    const targetIdx = albumPhotos.findIndex((p) => p.id === target.id)
    const direction = getSlideDirection(targetIdx)
    if (!direction) return

    setSlideDir(direction)
    setDisplayIndex(targetIdx)

    // After transition, actually switch the lightbox state
    setTimeout(() => {
      closeLightbox()
      openLightbox(target.id)
    }, 300)
  }

  // Determine which photo to render and the slide class
  const currentPhoto = albumPhotos[displayIndex] ?? photo
  const isSlidingLeft = slideDir === 'left'
  const slideClass = currentPhoto === photo
    ? ''
    : isSlidingLeft
      ? 'lightbox-slide-right'
      : 'lightbox-slide-left'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={closeLightbox}
      />

      {/* Navigation arrows */}
      {prevPhoto && (
        <button
          className="absolute left-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          onClick={() => navigate('prev')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {nextPhoto && (
        <button
          className="absolute right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          onClick={() => navigate('next')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Close button */}
      <button
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        onClick={closeLightbox}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-h-[90vh] max-w-[90vw] gap-3">
        <img
          src={currentPhoto.fullBase64}
          alt={currentPhoto.title}
          className={`max-h-[75vh] max-w-[85vw] object-contain rounded-lg shadow-2xl transition-transform duration-300 ease-out ${slideClass}`}
        />

        {/* Info bar */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-4 text-white text-sm">
          <span className="font-medium">{currentPhoto.title}</span>
          {currentPhoto.note && <span className="text-gray-300 italic truncate max-w-xs">— {currentPhoto.note}</span>}
          <span className="text-gray-400 text-xs">
            {currentPhoto.width}×{currentPhoto.height}
          </span>
        </div>
      </div>
    </div>
  )
}
