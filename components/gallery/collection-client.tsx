
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Collection, Album, Photo, Privacy } from '@/lib/types'
import { Lock, Globe, Pencil, Trash2, Check, X, Plus, FolderOpen, Image } from 'lucide-react'
import { cn } from '@/lib/utils'
import PhotoGrid from '@/components/gallery/photo-grid'
import AddPhotoModal from '@/components/add-photo-modal'
import { useRouter } from 'next/navigation'

const privacyOpts: { value: Privacy; icon: React.ElementType; label: string }[] = [
  { value: 'private', icon: Lock, label: 'Private' },
  { value: 'public', icon: Globe, label: 'Public' },
]

interface Props {
  collection: Collection | null // может быть null для "Unsorted"
  initialAlbums: Album[]
  unsortedPhotos?: Photo[] // фото без коллекции
}

export default function CollectionClient({ collection, initialAlbums, unsortedPhotos = [] }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [albums, setAlbums] = useState<Album[]>(initialAlbums)
  const [activeAlbum, setActiveAlbum] = useState<string>(initialAlbums[0]?.id ?? '')
  const [editingAlbum, setEditingAlbum] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [addPhotoOpen, setAddPhotoOpen] = useState(false)
  const [deletingCollection, setDeletingCollection] = useState(false)
  const [showUnsorted, setShowUnsorted] = useState(false)

  const activeAlbumData = albums.find((a) => a.id === activeAlbum)
  const isUnsorted = collection === null

  async function renameAlbum(albumId: string) {
    if (!editName.trim()) return
    await supabase.from('albums').update({ name: editName }).eq('id', albumId)
    setAlbums((prev) => prev.map((a) => (a.id === albumId ? { ...a, name: editName } : a)))
    setEditingAlbum(null)
  }

  async function deleteAlbum(albumId: string) {
    if (!confirm('Delete this album and all its photos?')) return
    await supabase.from('albums').delete().eq('id', albumId)
    const next = albums.filter((a) => a.id !== albumId)
    setAlbums(next)
    if (activeAlbum === albumId) setActiveAlbum(next[0]?.id ?? '')
  }

  async function changePrivacy(albumId: string, privacy: Privacy) {
    await supabase.from('albums').update({ privacy }).eq('id', albumId)
    setAlbums((prev) => prev.map((a) => (a.id === albumId ? { ...a, privacy } : a)))
  }

  async function deletePhoto(photoId: string) {
    await supabase.from('photos').delete().eq('id', photoId)
    setAlbums((prev) =>
      prev.map((a) => ({
        ...a,
        photos: (a.photos ?? []).filter((p: Photo) => p.id !== photoId),
      })),
    )
  }

  async function deleteCollection() {
    if (!collection) return
    if (!confirm('Delete this entire collection including all albums and photos? This cannot be undone.')) return
    setDeletingCollection(true)
    const { error } = await supabase.from('collections').delete().eq('id', collection.id)
    if (error) {
      alert(error.message)
      setDeletingCollection(false)
      return
    }
    router.push('/gallery')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Delete collection button (только для обычных коллекций) */}
      {!isUnsorted && (
        <div className="flex justify-end">
          <button
            onClick={deleteCollection}
            disabled={deletingCollection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
            {deletingCollection ? 'Deleting...' : 'Delete Collection'}
          </button>
        </div>
      )}

      {/* Header для Unsorted */}
      {isUnsorted && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Unsorted Photos</h2>
          </div>
          <button
            onClick={() => setAddPhotoOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Photo
          </button>
        </div>
      )}

      {/* Альбомы (только для обычных коллекций) */}
      {!isUnsorted && albums.length > 0 && (
        <>
          {/* Album tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => setActiveAlbum(album.id)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  activeAlbum === album.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                {album.name}
              </button>
            ))}
          </div>

          {/* Active album controls */}
          {activeAlbumData && (
            <div className="flex items-center gap-2 flex-wrap">
              {editingAlbum === activeAlbumData.id ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                  <button onClick={() => renameAlbum(activeAlbumData.id)} className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingAlbum(null)} className="w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => { setEditingAlbum(activeAlbumData.id); setEditName(activeAlbumData.name) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-xs transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Rename
                  </button>
                  <button
                    onClick={() => deleteAlbum(activeAlbumData.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-destructive text-xs transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete Album
                  </button>
                </>
              )}

              {/* Privacy toggle */}
              <div className="flex gap-1 ml-auto">
                {privacyOpts.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => changePrivacy(activeAlbumData.id, value)}
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                      activeAlbumData.privacy === value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground',
                    )}
                    title={value}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setAddPhotoOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Photo
              </button>
            </div>
          )}

          {/* Photos in selected album */}
          {activeAlbumData && (
            <PhotoGrid
              photos={(activeAlbumData.photos ?? []) as Photo[]}
              onDelete={deletePhoto}
            />
          )}
        </>
      )}

      {/* Если нет альбомов в коллекции */}
      {!isUnsorted && albums.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">No albums in this collection yet.</p>
            <button
              onClick={() => setAddPhotoOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add first photo
            </button>
          </div>
        </div>
      )}

      {/* Unsorted photos grid (если есть) */}
      {isUnsorted && unsortedPhotos.length > 0 && (
        <div className="mt-4">
          <PhotoGrid
            photos={unsortedPhotos}
            onDelete={deletePhoto}
          />
        </div>
      )}

      {/* Empty state для Unsorted */}
      {isUnsorted && unsortedPhotos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Image className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">No unsorted photos yet.</p>
            <button
              onClick={() => setAddPhotoOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add your first photo
            </button>
          </div>
        </div>
      )}

      {/* Add photo modal */}
      {addPhotoOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setAddPhotoOpen(false)}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm glass rounded-2xl p-6 z-10" onClick={(e) => e.stopPropagation()}>
            <AddPhotoModal
              onClose={() => setAddPhotoOpen(false)}
              onBack={() => setAddPhotoOpen(false)}
              preselectedCollection={collection || undefined}
              preselectedAlbum={activeAlbumData || undefined}
            />
          </div>
        </div>
      )}
    </div>
  )
}

