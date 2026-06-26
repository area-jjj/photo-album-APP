import { useAlbums } from '@/hooks/useAlbums'
import AlbumModal from './AlbumModal'

export default function AlbumSidebar() {
  const {
    albums,
    activeAlbumId,
    setActiveAlbum,
    isAlbumModalOpen,
    openAlbumModal,
  } = useAlbums()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-xl">📷</span>
          我的相册
        </h1>
      </div>

      {/* Album list */}
      <nav className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => setActiveAlbum(null)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mb-1 ${
            activeAlbumId === null
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="text-lg">📁</span>
          <span className="text-sm font-medium flex-1 truncate">所有照片</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeAlbumId === null
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {albums.find((a) => a.id === '__default__all__')?.photoCount || 0}
          </span>
        </button>

        <div className="mt-3 mb-1 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          图集
        </div>

        {albums
          .filter((a) => a.id !== '__default__all__')
          .map((album) => (
            <button
              key={album.id}
              onClick={() => setActiveAlbum(album.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mb-1 ${
                activeAlbumId === album.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">🎞️</span>
              <span className="text-sm font-medium flex-1 truncate">{album.name}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeAlbumId === album.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {album.photoCount}
              </span>
            </button>
          ))}
      </nav>

      {/* Create album button */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={openAlbumModal}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary-light transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建图集
        </button>
      </div>

      {isAlbumModalOpen && <AlbumModal />}
    </aside>
  )
}
