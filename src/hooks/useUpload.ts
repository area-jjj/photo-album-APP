import { useCallback } from 'react'
import { useStore } from '@/stores/useStore'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']

export function useUpload() {
  const uploadPhotos = useStore((s) => s.uploadPhotos)
  const activeAlbumId = useStore((s) => s.activeAlbumId)

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const validFiles = Array.from(files).filter((f) => {
        if (!ALLOWED_TYPES.includes(f.type)) {
          alert(`不支持的文件格式: ${f.name}`)
          return false
        }
        if (f.size > MAX_FILE_SIZE) {
          alert(`文件过大 (${f.name})，最大支持 20MB`)
          return false
        }
        return true
      })

      if (validFiles.length === 0) return

      const albumId = activeAlbumId || '__default__all__'
      await uploadPhotos(validFiles, albumId)
    },
    [uploadPhotos, activeAlbumId],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files)
        e.target.value = '' // Reset so same file can be selected again
      }
    },
    [processFiles],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.dataTransfer.files) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return { processFiles, handleInputChange, handleDrop, handleDragOver }
}
