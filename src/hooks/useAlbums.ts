import { useStore } from '@/stores/useStore'

export function useAlbums() {
  return {
    albums: useStore((s) => s.albums),
    activeAlbumId: useStore((s) => s.activeAlbumId),
    setActiveAlbum: useStore((s) => s.setActiveAlbum),
    createAlbum: useStore((s) => s.createAlbum),
    deleteAlbum: useStore((s) => s.deleteAlbum),
    renameAlbum: useStore((s) => s.renameAlbum),
    isAlbumModalOpen: useStore((s) => s.isAlbumModalOpen),
    openAlbumModal: useStore((s) => s.openAlbumModal),
    closeAlbumModal: useStore((s) => s.closeAlbumModal),
  }
}
