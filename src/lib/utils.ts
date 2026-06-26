import { v4 as uuid } from 'uuid'

export function generateId(): string {
  return uuid()
}

/**
 * Convert a File to a base64 data URL.
 * Optionally compress via canvas to a max width, returning a JPEG blob URL.
 */
export async function fileToThumbnail(file: File, maxWidth = 400): Promise<{
  thumbnailBase64: string
  fullBase64: string
  width: number
  height: number
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const { width, height } = img
      URL.revokeObjectURL(url)

      // Full resolution as base64
      const fullCanvas = document.createElement('canvas')
      fullCanvas.width = width
      fullCanvas.height = height
      const fullCtx = fullCanvas.getContext('2d')!
      fullCtx.drawImage(img, 0, 0)
      const fullBase64 = fullCanvas.toDataURL(file.type || 'image/jpeg', 0.95)

      // Thumbnail
      let tw = width
      let th = height
      if (tw > maxWidth) {
        th = Math.round((th * maxWidth) / tw)
        tw = maxWidth
      }
      const thumbCanvas = document.createElement('canvas')
      thumbCanvas.width = tw
      thumbCanvas.height = th
      const thumbCtx = thumbCanvas.getContext('2d')!
      thumbCtx.drawImage(img, 0, 0, tw, th)
      const thumbnailBase64 = thumbCanvas.toDataURL('image/jpeg', 0.7)

      resolve({ thumbnailBase64, fullBase64, width, height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
