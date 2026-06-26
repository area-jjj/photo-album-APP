import { useMemo } from 'react'
import { useStore } from '@/stores/useStore'

export function usePhotos() {
  const photos = useStore((s) => s.photos)
  const activeAlbumId = useStore((s) => s.activeAlbumId)
  const searchQuery = useStore((s) => s.searchQuery)
  const searchDateFrom = useStore((s) => s.searchDateFrom)
  const searchDateTo = useStore((s) => s.searchDateTo)
  const searchFilterNote = useStore((s) => s.searchFilterNote)
  const expandedPhotoId = useStore((s) => s.expandedPhotoId)
  const openExpandedView = useStore((s) => s.openExpandedView)
  const closeExpandedView = useStore((s) => s.closeExpandedView)

  const albumPhotos = useMemo(() => {
    if (!activeAlbumId) return photos
    return photos.filter((p) => p.albumId === activeAlbumId)
  }, [photos, activeAlbumId])

  const filteredPhotos = useMemo(() => {
    let result = albumPhotos

    if (searchFilterNote) {
      result = result.filter((p) => p.note && p.note.trim().length > 0)
    }

    if (searchDateFrom) {
      const fromMs = new Date(searchDateFrom).getTime()
      result = result.filter((p) => p.createdAt >= fromMs)
    }
    if (searchDateTo) {
      const toMs = new Date(searchDateTo).getTime() + 24 * 60 * 60 * 1000 - 1
      result = result.filter((p) => p.createdAt <= toMs)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.note.toLowerCase().includes(q)
      )
    }

    return result
  }, [albumPhotos, searchQuery, searchDateFrom, searchDateTo, searchFilterNote])

  // Find expanded photo and its index in filtered list
  const expandedPhoto = useMemo(() => {
    if (!expandedPhotoId) return null
    return filteredPhotos.find((p) => p.id === expandedPhotoId) ?? null
  }, [expandedPhotoId, filteredPhotos])

  const expandedIndex = useMemo(() => {
    if (!expandedPhotoId) return -1
    return filteredPhotos.findIndex((p) => p.id === expandedPhotoId)
  }, [expandedPhotoId, filteredPhotos])

  const hasPrev = expandedIndex > 0
  const hasNext = expandedIndex >= 0 && expandedIndex < filteredPhotos.length - 1

  const goPrev = () => {
    if (hasPrev) {
      closeExpandedView()
      setTimeout(() => {
        openExpandedView(filteredPhotos[expandedIndex - 1].id)
      }, 150)
    }
  }

  const goNext = () => {
    if (hasNext) {
      closeExpandedView()
      setTimeout(() => {
        openExpandedView(filteredPhotos[expandedIndex + 1].id)
      }, 150)
    }
  }

  return {
    photos,
    albumPhotos,
    filteredPhotos,
    activeAlbumId,
    expandedPhoto,
    expandedIndex,
    hasPrev,
    hasNext,
    openExpandedView,
    closeExpandedView,
    goPrev,
    goNext,
  }
}
