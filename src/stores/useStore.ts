import { create } from 'zustand'
import type { Photo, Album } from '@/types/photo'
import * as db from '@/lib/db'
import { generateId, fileToThumbnail } from '@/lib/utils'

interface AppState {
  // Data
  photos: Photo[]
  albums: Album[]
  defaultAlbumId: string | null

  // UI state
  activeAlbumId: string | null // null = "All Photos"
  selectedPhotos: string[] // photo ids
  lightboxPhotoId: string | null
  expandedPhotoId: string | null // for inline expanded view
  isAlbumModalOpen: boolean
  isSelectMode: boolean
  storageUsed: number
  storageQuota: number | null
  // Search
  searchQuery: string
  searchDateFrom: string
  searchDateTo: string
  searchFilterNote: boolean

  // Actions
  loadInitialData: () => Promise<void>
  uploadPhotos: (files: File[], albumId: string) => Promise<void>
  updateNote: (photoId: string, note: string) => Promise<void>
  updatePhoto: (partial: Partial<Photo> & { id: string }) => Promise<void>
  createAlbum: (name: string, description: string) => Promise<void>
  renameAlbum: (id: string, name: string) => Promise<void>
  deletePhoto: (id: string) => Promise<void>
  deletePhotos: (ids: string[]) => Promise<void>
  deleteAlbum: (id: string) => Promise<void>
  setActiveAlbum: (id: string | null) => void
  toggleSelectMode: () => void
  togglePhotoSelection: (id: string) => void
  deselectAll: () => void
  openLightbox: (id: string) => void
  closeLightbox: () => void
  closeAlbumModal: () => void
  openAlbumModal: () => void
  openExpandedView: (id: string) => void
  closeExpandedView: () => void
  refreshStorageInfo: () => Promise<void>
  moveSelectedToAlbum: (albumId: string) => Promise<void>
  setSearchQuery: (q: string) => void
  setSearchDateRange: (from: string, to: string) => void
  setSearchFilterNote: (v: boolean) => void
  clearSearch: () => void
}

const DEFAULT_ALBUM_ID = '__default__all__'

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  photos: [],
  albums: [],
  defaultAlbumId: DEFAULT_ALBUM_ID,

  activeAlbumId: null,
  selectedPhotos: [],
  lightboxPhotoId: null,
  expandedPhotoId: null,
  isAlbumModalOpen: false,
  isSelectMode: false,
  storageUsed: 0,
  storageQuota: null,
  searchQuery: '',
  searchDateFrom: '',
  searchDateTo: '',
  searchFilterNote: false,

  loadInitialData: async () => {
    const photos = await db.getAllPhotos()
    const albums = await db.getAllAlbums()

    // Ensure default album exists
    const defaultAlbum = albums.find((a) => a.id === DEFAULT_ALBUM_ID)
    if (!defaultAlbum) {
      const newAlbum: Album = {
        id: DEFAULT_ALBUM_ID,
        name: '所有照片',
        description: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        photoCount: photos.length,
      }
      await db.addAlbum(newAlbum)
      albums.unshift(newAlbum)
    } else {
      // Update count
      const count = await db.getAllPhotosCount()
      albums.forEach((a) => {
        if (a.id === DEFAULT_ALBUM_ID) {
          a.photoCount = count
        }
      })
    }

    set({ photos, albums, storageUsed: photos.reduce((sum, p) => sum + p.fileSize, 0) })
    await get().refreshStorageInfo()
  },

  uploadPhotos: async (files: File[], albumId: string) => {
    const newPhotos: Photo[] = []
    for (const file of files) {
      try {
        const { thumbnailBase64, fullBase64, width, height } =
          await fileToThumbnail(file)
        const id = generateId()
        const now = Date.now()
        newPhotos.push({
          id,
          albumId,
          title: file.name.replace(/\.[^.]+$/, ''),
          note: '',
          thumbnailBase64,
          fullBase64,
          width,
          height,
          fileSize: file.size,
          mimeType: file.type,
          createdAt: now,
          updatedAt: now,
        })
      } catch {
        // Skip invalid files
      }
    }

    if (newPhotos.length === 0) return

    for (const photo of newPhotos) {
      await db.addPhoto(photo)
    }

    const allPhotos = [...(await db.getAllPhotos()), ...newPhotos]
    set({ photos: allPhotos })

    // Update album count
    const album = get().albums.find((a) => a.id === albumId)
    if (album) {
      const count = await db.getPhotoCountByAlbum(albumId)
      await db.updateAlbum(albumId, { photoCount: count })
      set({ albums: get().albums.map((a) => (a.id === albumId ? { ...a, photoCount: count } : a)) })
    }
  },

  updatePhoto: async (partial: Partial<Photo> & { id: string }) => {
    await db.updatePhoto(partial)
    set({
      photos: get().photos.map((p) =>
        p.id === partial.id ? { ...p, ...partial } : p
      ),
    })
  },

  updateNote: async (photoId: string, note: string) => {
    await db.updatePhoto({ id: photoId, note, updatedAt: Date.now() })
    set({
      photos: get().photos.map((p) =>
        p.id === photoId ? { ...p, note, updatedAt: Date.now() } : p
      ),
    })
  },

  createAlbum: async (name: string, description: string) => {
    const id = generateId()
    const now = Date.now()
    const album: Album = {
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      photoCount: 0,
    }
    await db.addAlbum(album)
    set({ albums: [album, ...get().albums] })
    set({ isAlbumModalOpen: false })
  },

  renameAlbum: async (id: string, name: string) => {
    await db.updateAlbum(id, { name, updatedAt: Date.now() })
    set({
      albums: get().albums.map((a) =>
        a.id === id ? { ...a, name, updatedAt: Date.now() } : a
      ),
    })
  },

  deletePhotos: async (ids: string[]) => {
    await Promise.all(ids.map((id) => db.deletePhoto(id)))
    const updatedPhotos = get().photos.filter((p) => !ids.includes(p.id))
    set({ photos: updatedPhotos })

    // Recalculate all album counts from the updated photo list
    const counts: Record<string, number> = {}
    for (const p of updatedPhotos) {
      counts[p.albumId] = (counts[p.albumId] || 0) + 1
    }
    set({
      albums: get().albums.map((a) => ({
        ...a,
        photoCount: counts[a.id] || 0,
      })),
    })
  },

  deletePhoto: async (id: string) => {
    await db.deletePhoto(id)
    const updatedPhotos = get().photos.filter((p) => p.id !== id)
    set({ photos: updatedPhotos })

    // Recalculate all album counts from the updated photo list
    const counts: Record<string, number> = {}
    for (const p of updatedPhotos) {
      counts[p.albumId] = (counts[p.albumId] || 0) + 1
    }
    set({
      albums: get().albums.map((a) => ({
        ...a,
        photoCount: counts[a.id] || 0,
      })),
    })
  },

  deleteAlbum: async (id: string) => {
    if (id === DEFAULT_ALBUM_ID) return // Can't delete default
    await db.deleteAlbum(id)
    // Move photos back to default album
    const photos = get().photos
    for (const photo of photos) {
      if (photo.albumId === id) {
        await db.updatePhoto({ id: photo.id, albumId: DEFAULT_ALBUM_ID })
      }
    }
    const remainingAlbums = get().albums.filter((a) => a.id !== id)
    set({ albums: remainingAlbums, photos })

    if (get().activeAlbumId === id) {
      set({ activeAlbumId: null })
    }
  },

  setActiveAlbum: (id: string | null) => {
    set({ activeAlbumId: id, selectedPhotos: [], isSelectMode: false })
  },

  toggleSelectMode: () => {
    const newMode = !get().isSelectMode
    set({ isSelectMode: newMode, selectedPhotos: newMode ? [] : get().selectedPhotos })
  },

  togglePhotoSelection: (id: string) => {
    const selected = get().selectedPhotos
    if (selected.includes(id)) {
      set({ selectedPhotos: selected.filter((s) => s !== id) })
    } else {
      set({ selectedPhotos: [...selected, id] })
    }
  },

  deselectAll: () => {
    set({ selectedPhotos: [] })
  },

  openLightbox: (id: string) => {
    set({ lightboxPhotoId: id })
  },

  closeLightbox: () => {
    set({ lightboxPhotoId: null })
  },

  closeAlbumModal: () => {
    set({ isAlbumModalOpen: false })
  },

  openAlbumModal: () => {
    set({ isAlbumModalOpen: true })
  },

  openExpandedView: (id: string) => {
    set({ expandedPhotoId: id })
  },

  closeExpandedView: () => {
    set({ expandedPhotoId: null })
  },

  refreshStorageInfo: async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await (navigator.storage as any).estimate()
        set({ storageQuota: estimate.quota ?? null })
      } catch {
        // Ignore
      }
    }
  },

  setSearchQuery: (q: string) => {
    set({ searchQuery: q })
  },

  setSearchDateRange: (from: string, to: string) => {
    set({ searchDateFrom: from, searchDateTo: to })
  },

  setSearchFilterNote: (v: boolean) => {
    set({ searchFilterNote: v })
  },

  clearSearch: () => {
    set({ searchQuery: '', searchDateFrom: '', searchDateTo: '', searchFilterNote: false })
  },

  moveSelectedToAlbum: async (albumId: string) => {
    const { selectedPhotos: ids } = get()
    const photos = get().photos
    for (const id of ids) {
      const photo = photos.find((p) => p.id === id)
      if (photo && photo.albumId !== albumId) {
        await db.updatePhoto({ id, albumId })
      }
    }
    const updatedPhotos = photos.map((p) =>
      ids.includes(p.id) ? { ...p, albumId } : p
    )
    set({ photos: updatedPhotos, selectedPhotos: [] })

    // Recalculate all album counts from the updated photo list in store
    const counts: Record<string, number> = {}
    for (const p of updatedPhotos) {
      counts[p.albumId] = (counts[p.albumId] || 0) + 1
    }
    set({
      albums: get().albums.map((a) => ({
        ...a,
        photoCount: counts[a.id] || 0,
      })),
    })
  },
}))
