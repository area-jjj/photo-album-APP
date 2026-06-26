import { useState } from 'react'
import { useAlbums } from '@/hooks/useAlbums'

export default function AlbumModal() {
  const { createAlbum, closeAlbumModal, albums } = useAlbums()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('请输入图集名称')
      return
    }
    if (albums.some((a) => a.name === name.trim())) {
      setError('该图集名称已存在')
      return
    }
    setError('')
    await createAlbum(name.trim(), description.trim())
    setName('')
    setDescription('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeAlbumModal}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-modal-enter">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">新建图集</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                图集名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                placeholder="例如：旅行照片、家人聚会..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                描述（可选）
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="给这个图集加个描述..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-3">{error}</p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeAlbumModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm"
              >
                创建
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
