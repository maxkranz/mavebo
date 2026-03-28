'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Photo, Collection, Album } from '@/lib/types'
import { Trash2, Lock, Users, Globe, Pencil, Check, X, FolderPlus, Move } from 'lucide-react'
import { cn } from '@/lib/utils'
import PhotoViewer from '@/components/photo-viewer'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Props {
  photos: Photo[]
  onDelete?: (id: string) => void
  showActions?: boolean
  onMoveToCollection?: (photoId: string, collectionId: string, albumId: string) => void
  collections?: Collection[]
  albumsMap?: Record<string, Album[]>
}

export default function PhotoGrid({ 
  photos, 
  onDelete, 
  showActions = true,
  onMoveToCollection,
  collections = [],
  albumsMap = {}
}: Props) {
  const supabase = createClient()
  const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [movingPhoto, setMovingPhoto] = useState<Photo | null>(null)
  const [selectedCollection, setSelectedCollection] = useState('')
  const [selectedAlbum, setSelectedAlbum] = useState('')
  const [albumsForCollection, setAlbumsForCollection] = useState<Album[]>([])

  async function rename(photo: Photo) {
    if (!editName.trim()) return
    await supabase.from('photos').update({ name: editName }).eq('id', photo.id)
    photo.name = editName
    setEditing(null)
  }

  async function movePhoto() {
    if (!movingPhoto || !selectedCollection) return

    // Если выбран альбом, используем его, иначе создаем новый альбом "Unsorted" в коллекции
    let albumId = selectedAlbum
    if (!albumId && selectedCollection) {
      // Создаем альбом "Unsorted" в выбранной коллекции
      const { data: existingAlbum } = await supabase
        .from('albums')
        .select('id')
        .eq('collection_id', selectedCollection)
        .eq('name', 'Unsorted')
        .maybeSingle()

      if (existingAlbum) {
        albumId = existingAlbum.id
      } else {
        const { data: newAlbum } = await supabase
          .from('albums')
          .insert({
            collection_id: selectedCollection,
            name: 'Unsorted',
            privacy: 'private',
            sort_order: 0
          })
          .select()
          .single()
        albumId = newAlbum.id
      }
    }

    // Обновляем фото
    const { error } = await supabase
      .from('photos')
      .update({
        collection_id: selectedCollection,
        album_id: albumId
      })
      .eq('id', movingPhoto.id)

    if (!error && onMoveToCollection) {
      onMoveToCollection(movingPhoto.id, selectedCollection, albumId)
    }

    setMovingPhoto(null)
    setSelectedCollection('')
    setSelectedAlbum('')
    setAlbumsForCollection([])
  }

  function handleCollectionChange(collectionId: string) {
    setSelectedCollection(collectionId)
    setSelectedAlbum('')
    setAlbumsForCollection(albumsMap[collectionId] || [])
  }

  if (photos.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No photos here yet.
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative rounded-xl overflow-hidden bg-muted aspect-square">
            <img
              src={photo.url}
              alt={photo.name}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
              onClick={() => setViewerPhoto(photo)}
            />
            {showActions && (
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex items-center justify-between gap-1">
                  {editing === photo.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 rounded-lg bg-background/80 text-xs text-foreground focus:outline-none"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button onClick={(e) => { e.stopPropagation(); rename(photo) }} className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setEditing(null) }} className="w-6 h-6 rounded-md bg-muted text-foreground flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-[10px] font-medium text-white truncate flex-1 drop-shadow">{photo.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditing(photo.id); setEditName(photo.name) }}
                          className="w-6 h-6 rounded-md bg-background/70 text-foreground flex items-center justify-center hover:bg-background/90 transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        {!photo.collection_id && onMoveToCollection && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                onClick={(e) => { e.stopPropagation(); setMovingPhoto(photo) }}
                                className="w-6 h-6 rounded-md bg-background/70 text-foreground flex items-center justify-center hover:bg-primary/70 hover:text-white transition-colors"
                                title="Move to collection"
                              >
                                <Move className="w-3 h-3" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Move to Collection</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Choose a collection and album for this photo.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <label className="text-sm font-medium">Collection</label>
                                  <select
                                    value={selectedCollection}
                                    onChange={(e) => handleCollectionChange(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-lg bg-input border border-border text-sm"
                                  >
                                    <option value="">Select collection</option>
                                    {collections.map((c) => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                  </select>
                                </div>
                                {selectedCollection && (
                                  <div>
                                    <label className="text-sm font-medium">Album (optional)</label>
                                    <select
                                      value={selectedAlbum}
                                      onChange={(e) => setSelectedAlbum(e.target.value)}
                                      className="w-full mt-1 px-3 py-2 rounded-lg bg-input border border-border text-sm"
                                    >
                                      <option value="">No album (will go to Unsorted)</option>
                                      {albumsForCollection.map((a) => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setMovingPhoto(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={movePhoto} disabled={!selectedCollection}>
                                  Move
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {onDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                onClick={(e) => { e.stopPropagation() }}
                                className="w-6 h-6 rounded-md bg-background/70 text-foreground flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{photo.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => onDelete(photo.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {viewerPhoto && (
        <PhotoViewer photo={viewerPhoto} onClose={() => setViewerPhoto(null)} />
      )}
    </>
  )
}
