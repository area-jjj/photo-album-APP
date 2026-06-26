import PhotoCard from './PhotoCard'
import type { Photo } from '@/types/photo'

interface PhotoGridProps {
  photos: Photo[]
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  if (photos.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {photos.map((photo, i) => (
        <div
          key={photo.id}
          style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
          className="animate-fade-in"
        >
          <PhotoCard photo={photo} />
        </div>
      ))}
    </div>
  )
}
