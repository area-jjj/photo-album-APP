import { openDB, type IDBPDatabase } from 'idb'
import type { Photo, Album } from '@/types/photo'

const DB_NAME = 'PhotoAlbumDB'
const DB_VERSION = 1

interface PhotoAlbumDB {
  stores: {
    photos: Photo
    albums: Album
  }
}

let dbPromise: Promise<IDBPDatabase<PhotoAlbumDB>> | null = null

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const photoStore = db.createObjectStore('photos', { keyPath: 'id' })
        photoStore.createIndex('by_album', 'albumId')
        photoStore.createIndex('by_created', 'createdAt')

        db.createObjectStore('albums', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

// ── Photos ──────────────────────────────────────────────

export async function getAllPhotos(): Promise<Photo[]> {
  const db = await getDB()
  return db.getAllFromIndex('photos', 'by_created')
}

export async function getPhotosByAlbum(albumId: string): Promise<Photo[]> {
  const db = await getDB()
  return db.getAllFromIndex('photos', 'by_album', albumId)
}

export async function getPhotoById(id: string): Promise<Photo | undefined> {
  const db = await getDB()
  return db.get('photos', id)
}

export async function addPhoto(photo: Photo): Promise<void> {
  const db = await getDB()
  await db.put('photos', photo)
}

export async function updatePhoto(partial: Partial<Photo> & { id: string }): Promise<void> {
  const db = await getDB()
  const existing = await db.get('photos', partial.id)
  if (existing) {
    await db.put('photos', { ...existing, ...partial })
  }
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('photos', id)
}

// ── Albums ──────────────────────────────────────────────

export async function getAllAlbums(): Promise<Album[]> {
  const db = await getDB()
  return db.getAll('albums')
}

export async function getAlbumById(id: string): Promise<Album | undefined> {
  const db = await getDB()
  return db.get('albums', id)
}

export async function addAlbum(album: Album): Promise<void> {
  const db = await getDB()
  await db.put('albums', album)
}

export async function updateAlbum(id: string, partial: Partial<Album>): Promise<void> {
  const db = await getDB()
  const existing = await db.get('albums', id)
  if (existing) {
    await db.put('albums', { ...existing, ...partial })
  }
}

export async function deleteAlbum(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('albums', id)
}

// ── Counts ──────────────────────────────────────────────

export async function getPhotoCountByAlbum(albumId: string): Promise<number> {
  const db = await getDB()
  const results = await db.getAllFromIndex('photos', 'by_album', albumId)
  return results.length
}

export async function getAllPhotosCount(): Promise<number> {
  const db = await getDB()
  return db.count('photos')
}
