import { useRef, useState } from 'react'
import { useUpload } from '@/hooks/useUpload'

export default function UploadZone() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { handleInputChange, handleDrop, handleDragOver } = useUpload()
  const [isDragging, setIsDragging] = useState(false)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
        isDragging
          ? 'border-primary bg-primary-light/30 scale-[1.01]'
          : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
      }`}
      onDragEnter={() => setIsDragging(true)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={() => setIsDragging(false)}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3">
        {/* Upload icon */}
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>

        <div>
          <p className="text-gray-700 font-medium">拖放照片到这里，或 <button onClick={handleClick} className="text-primary hover:text-primary-hover underline cursor-pointer">浏览文件</button></p>
          <p className="text-gray-400 text-sm mt-1">支持 JPG、PNG、WebP、GIF、BMP，单个文件最大 20MB</p>
        </div>
      </div>
    </div>
  )
}
