import { useState } from 'react'
import { useStore } from '@/stores/useStore'
import { useAlbums } from '@/hooks/useAlbums'
import { usePhotos } from '@/hooks/usePhotos'
import UploadZone from '@/components/UploadZone'
import PhotoGrid from '@/components/PhotoGrid'
import AlbumSidebar from '@/components/AlbumSidebar'
import LightboxModal from '@/components/LightboxModal'
import ExpandedView from '@/components/ExpandedView'
import EmptyState from '@/components/ui/EmptyState'
import Badge from '@/components/ui/Badge'
import type { Album as AlbumType } from '@/types/photo'

export default function HomePage() {
  const { filteredPhotos, expandedPhoto, hasPrev, hasNext, goPrev, goNext, closeExpandedView } = usePhotos()
  const { albums, activeAlbumId } = useAlbums()
  const isSelectMode = useStore((s) => s.isSelectMode)
  const selectedCount = useStore((s) => s.selectedPhotos.length)
  const toggleSelectMode = useStore((s) => s.toggleSelectMode)
  const deselectAll = useStore((s) => s.deselectAll)
  const moveSelectedToAlbum = useStore((s) => s.moveSelectedToAlbum)
  const deletePhotos = useStore((s) => s.deletePhotos)
  const storageUsed = useStore((s) => s.storageUsed)
  const storageQuota = useStore((s) => s.storageQuota)
  const searchQuery = useStore((s) => s.searchQuery)
  const searchDateFrom = useStore((s) => s.searchDateFrom)
  const searchDateTo = useStore((s) => s.searchDateTo)
  const searchFilterNote = useStore((s) => s.searchFilterNote)
  const setSearchQuery = useStore((s) => s.setSearchQuery)
  const setSearchDateRange = useStore((s) => s.setSearchDateRange)
  const setSearchFilterNote = useStore((s) => s.setSearchFilterNote)
  const clearSearch = useStore((s) => s.clearSearch)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const albumName = activeAlbumId
    ? albums.find((a: AlbumType) => a.id === activeAlbumId)?.name
    : '所有照片'

  const storagePercent = storageQuota ? (storageUsed / storageQuota) * 100 : 0
  const storageColor =
    storagePercent > 90 ? 'bg-red-500' :
    storagePercent > 70 ? 'bg-yellow-500' :
    'bg-primary'

  const hasActiveSearch = searchQuery.trim() || searchDateFrom || searchDateTo || searchFilterNote

  const handleMoveToAlbum = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetAlbumId = e.target.value
    if (targetAlbumId) {
      await moveSelectedToAlbum(targetAlbumId)
    }
  }

  const handleDeleteSelected = async () => {
    const ids = useStore.getState().selectedPhotos
    await deletePhotos(ids)
    deselectAll()
    toggleSelectMode()
    setShowDeleteConfirm(false)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AlbumSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-gray-800">{albumName}</h2>
              <Badge>{filteredPhotos.length} 张照片</Badge>
            </div>

            <div className="flex items-center gap-3">
              {/* Search toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  showSearch || hasActiveSearch
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {hasActiveSearch ? '筛选中' : '搜索'}
              </button>

              {/* Select mode */}
              {filteredPhotos.length > 0 && (
                <button
                  onClick={toggleSelectMode}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    isSelectMode
                      ? 'bg-primary text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {isSelectMode ? '取消选择' : '选择'}
                </button>
              )}

              {/* Storage info */}
              {storageQuota && storagePercent > 0 && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                  <div className="storage-gauge w-16">
                    <div
                      className={`storage-gauge-fill ${storageColor}`}
                      style={{ width: `${Math.min(storagePercent, 100)}%` }}
                    />
                  </div>
                  <span>{(storageUsed / (1024 * 1024)).toFixed(0)}MB</span>
                </div>
              )}
            </div>
          </div>

          {/* Search panel */}
          {showSearch && (
            <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索照片名称或备注内容..."
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={searchDateFrom}
                    onChange={(e) => setSearchDateRange(e.target.value, searchDateTo)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <span className="text-gray-400 text-sm">至</span>
                  <input
                    type="date"
                    value={searchDateTo}
                    onChange={(e) => setSearchDateRange(searchDateFrom, e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={searchFilterNote}
                      onChange={(e) => setSearchFilterNote(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                  </div>
                  仅看有备注
                </label>

                {hasActiveSearch && (
                  <button
                    onClick={clearSearch}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
                  >
                    清除筛选
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Content area */}
        <div className="p-6 max-w-7xl mx-auto">
          {/* Upload zone */}
          <div className="mb-6">
            <UploadZone />
          </div>

          {/* Photo grid */}
          {filteredPhotos.length > 0 ? (
            <PhotoGrid photos={filteredPhotos} />
          ) : (
            <EmptyState
              icon={hasActiveSearch ? '🔍' : '📸'}
              title={hasActiveSearch ? '没有找到匹配的照片' : '还没有照片'}
              description={
                hasActiveSearch
                  ? '尝试调整搜索条件，或上传新的照片'
                  : '点击上方区域上传照片，点击照片可在下方查看详情和备注'
              }
            />
          )}
        </div>

        {/* Selection bar */}
        {isSelectMode && selectedCount > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-in-bottom">
            <div className="bg-gray-900/90 backdrop-blur-md text-white rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-4">
              <span className="text-sm font-medium">
                已选 {selectedCount} 张
              </span>

              <select
                onChange={handleMoveToAlbum}
                defaultValue=""
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="" disabled className="text-gray-400">
                  移动到...
                </option>
                {albums
                  .filter((a: AlbumType) => a.id !== '__default__all__')
                  .map((a: AlbumType) => (
                    <option key={a.id} value={a.id} className="text-gray-800">
                      {a.name}
                    </option>
                  ))}
              </select>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
              >
                删除
              </button>

              <button
                onClick={() => {
                  deselectAll()
                  toggleSelectMode()
                }}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-modal-enter">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">确认删除</h3>
                <p className="text-sm text-gray-500">
                  将永久删除选中的 <strong>{selectedCount}</strong> 张照片，此操作不可撤销。
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expanded view overlay */}
        {expandedPhoto && (
          <div className="fixed inset-0 z-[100]" onClick={closeExpandedView}>
            <ExpandedView
              photo={expandedPhoto}
              onClose={closeExpandedView}
              onPrev={goPrev}
              onNext={goNext}
              hasPrev={hasPrev}
              hasNext={hasNext}
            />
          </div>
        )}
      </main>

      {/* Lightbox */}
      <LightboxModal />
    </div>
  )
}
