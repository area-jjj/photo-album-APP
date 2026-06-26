export interface Photo {
  id: string
  albumId: string
  title: string
  note: string
  thumbnailBase64: string
  fullBase64: string
  width: number
  height: number
  fileSize: number
  mimeType: string
  createdAt: number
  updatedAt: number
}

export interface Album {
  id: string
  name: string
  description: string
  createdAt: number
  updatedAt: number
  coverPhotoId?: string
  photoCount: number
}
