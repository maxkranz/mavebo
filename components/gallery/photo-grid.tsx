'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Photo, Collection, Album, Privacy } from '@/lib/types'
import { Trash2, Pencil, MoreVertical, Lock, Globe, X, Check, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import PhotoViewer from '@/components/photo-viewer'
import AddModal from '@/components/add-modal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Props {
  photos: Photo[]
  onDelete?: (id: string) => Promise<void>
  onMove?: (photo: Photo, collectionId: string, albumId: string) => Promise<void>
  onRename?: (id: string, newName: string) => Promise<void>
  onPrivacyChange?: (id: string, privacy: Privacy) => Promise<void>
  collections?: Collection[]
  albumsMap?: Record<string, Album[]>
  showActions?: boolean
  isOwn?: boolean
  onRefresh?: () => Promise<void>
  onPhotoUpdate?: (photoId: string, updates: Partial<Photo>) => void
}

export default function PhotoGrid({ 
  photos: externalPhotos,
  onDelete, 
  onMove, 
  onRename, 
  onPrivacyChange,
  collections: externalCollections,
  albumsMap = {},
  showActions = true,
  isOwn = true,
  onRefresh,
  onPhotoUpdate
}: Props) {
  const supabase = createClient()
  const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editing, setEditing] = useState(false)
  const [moveCollection, setMoveCollection] = useState('')
  const [moveAlbum, setMoveAlbum] = useState('')
  const [albumsForMove, setAlbumsForMove] = useState<Album[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [collections, setCollections] = useState<Collection[]>(externalCollections || [])
  const [collectionsLoading, setCollectionsLoading] = useState(!externalCollections)
  const [photos, setPhotos] = useState<Photo[]>(externalPhotos)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const previousPhotosRef = useRef<Photo[]>(externalPhotos)

  // Синхронизируем внешние фото с локальным состоянием ТОЛЬКО при реальных изменениях
  useEffect(() => {
    // Сравниваем по ID, чтобы избежать бесконечного цикла
    const hasChanged = 
      externalPhotos.length !== previousPhotosRef.current.length ||
      JSON.stringify(externalPhotos.map(p => p.id)) !== JSON.stringify(previousPhotosRef.current.map(p => p.id))
    
    if (hasChanged) {
      setPhotos(externalPhotos)
      previousPhotosRef.current = externalPhotos
    }
  }, [externalPhotos])

  // Загружаем коллекции если не переданы извне
  useEffect(() => {
    if (externalCollections) {
      setCollections(externalCollections)
      setCollectionsLoading(false)
      return
    }
    
    async function loadCollections() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setCollectionsLoading(false)
        return
      }
      const { data } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order')
      setCollections(data ?? [])
      setCollectionsLoading(false)
    }
    loadCollections()
  }, [externalCollections, supabase])

  // Мгновенное обновление фото в локальном состоянии
  const updateLocalPhoto = (photoId: string, updates: Partial<Photo>) => {
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, ...updates } : p))
    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto({ ...selectedPhoto, ...updates })
    }
    if (onPhotoUpdate) {
      onPhotoUpdate(photoId, updates)
    }
  }

  // Мгновенное удаление фото из локального состояния
  const deleteLocalPhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
    if (selectedPhoto?.id === photoId) {
      setSettingsOpen(false)
      setSelectedPhoto(null)
    }
  }

  async function handleRename() {
    if (!editName.trim() || !selectedPhoto) return
    setLoading(true)
    try {
      if (onRename) {
        await onRename(selectedPhoto.id, editName)
      } else {
        await supabase.from('photos').update({ name: editName }).eq('id', selectedPhoto.id)
      }
      updateLocalPhoto(selectedPhoto.id, { name: editName })
      setEditing(false)
    } catch (error) {
      console.error('Error renaming:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handlePrivacyChange(privacy: Privacy) {
    if (!selectedPhoto) return
    setLoading(true)
    try {
      if (onPrivacyChange) {
        await onPrivacyChange(selectedPhoto.id, privacy)
      } else {
        await supabase.from('photos').update({ privacy }).eq('id', selectedPhoto.id)
      }
      updateLocalPhoto(selectedPhoto.id, { privacy })
    } catch (error) {
      console.error('Error changing privacy:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleMove() {
    if (!selectedPhoto || !moveCollection) return
    setLoading(true)
    try {
      let albumId = moveAlbum
      if (!albumId && moveCollection) {
        const { data: existingAlbum } = await supabase
          .from('albums')
          .select('id')
          .eq('collection_id', moveCollection)
          .eq('name', 'Unsorted')
          .maybeSingle()

        if (existingAlbum) {
          albumId = existingAlbum.id
        } else {
          const { data: newAlbum } = await supabase
            .from('albums')
            .insert({
              collection_id: moveCollection,
              name: 'Unsorted',
              privacy: 'private',
              sort_order: 0
            })
            .select()
            .single()
          albumId = newAlbum.id
        }
      }

      if (onMove) {
        await onMove(selectedPhoto, moveCollection, albumId)
      } else {
        await supabase
          .from('photos')
          .update({
            collection_id: moveCollection,
            album_id: albumId
          })
          .eq('id', selectedPhoto.id)
      }
      
      deleteLocalPhoto(selectedPhoto.id)
      setSettingsOpen(false)
      setMoveCollection('')
      setMoveAlbum('')
      setAlbumsForMove([])
    } catch (error) {
      console.error('Error moving photo:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCollectionChange(collectionId: string) {
    setMoveCollection(collectionId)
    setMoveAlbum('')
    
    const { data } = await supabase
      .from('albums')
      .select('*')
      .eq('collection_id', collectionId)
    setAlbumsForMove(data ?? [])
  }

  async function handleDelete() {
    if (!selectedPhoto) return
    setLoading(true)
    try {
      if (onDelete) {
        await onDelete(selectedPhoto.id)
      } else {
        await supabase.from('photos').delete().eq('id', selectedPhoto.id)
      }
      deleteLocalPhoto(selectedPhoto.id)
      setDeleteDialogOpen(false)
      setSettingsOpen(false)
    } catch (error) {
      console.error('Error deleting photo:', error)
    } finally {
      setLoading(false)
    }
  }

  function openSettings(photo: Photo) {
    setSelectedPhoto(photo)
    setEditName(photo.name)
    setEditing(false)
    setMoveCollection('')
    setMoveAlbum('')
    setAlbumsForMove([])
    setSettingsOpen(true)
  }

  function handleAddPhotoSuccess() {
    if (onRefresh) {
      onRefresh()
    }
    setAddModalOpen(false)
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-center text-sm text-muted-foreground">
          No photos here yet.
        </div>
        {isOwn && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add your first photo
          </button>
        )}
        <AddModal open={addModalOpen} onClose={handleAddPhotoSuccess} />
      </div>
    )
  }

  return (
    <>
      {isOwn && photos.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Photo
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative rounded-xl overflow-hidden bg-muted aspect-square">
            <img
              src={photo.url}
              alt={photo.name}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
              onClick={() => setViewerPhoto(photo)}
            />
            
            {/* Privacy badge */}
            <div className="absolute top-2 left-2">
              <div className={cn(
                'px-1.5 py-0.5 rounded-md text-[10px] font-medium backdrop-blur-sm',
                photo.privacy === 'public' 
                  ? 'bg-green-500/80 text-white' 
                  : 'bg-gray-500/80 text-white'
              )}>
                {photo.privacy === 'public' ? 'Public' : 'Private'}
              </div>
            </div>
            
            {showActions && isOwn && (
              <>
                <div className="absolute inset-0 bg-foreground/0 md:group-hover:bg-foreground/30 transition-all duration-200" />
                
                <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); openSettings(photo) }}
                    className="w-7 h-7 rounded-md bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-2 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-200">
                  <span className="text-[10px] font-medium text-white truncate block drop-shadow bg-black/50 px-1.5 py-0.5 rounded">
                    {photo.name}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {viewerPhoto && (
        <PhotoViewer photo={viewerPhoto} onClose={() => setViewerPhoto(null)} />
      )}

      <AddModal open={addModalOpen} onClose={handleAddPhotoSuccess} />

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="glass rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Photo Settings</DialogTitle>
            <DialogDescription>
              Manage settings for "{selectedPhoto?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Rename */}
            <div>
              <label className="text-sm font-medium text-foreground">Photo Name</label>
              <div className="flex gap-2 mt-1">
                {editing ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-input border border-border text-sm"
                      autoFocus
                    />
                    <button
                      onClick={handleRename}
                      disabled={loading}
                      className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50">
                    <span className="text-sm text-foreground">{selectedPhoto?.name}</span>
                    <button
                      onClick={() => setEditing(true)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Move to Collection */}
            <div>
              <label className="text-sm font-medium text-foreground">Move to Collection</label>
              {collectionsLoading ? (
                <div className="mt-1 px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  Loading collections...
                </div>
              ) : (
                <>
                  <select
                    value={moveCollection}
                    onChange={(e) => handleCollectionChange(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-input border border-border text-sm"
                  >
                    <option value="">Select collection</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {moveCollection && albumsForMove.length > 0 && (
                    <select
                      value={moveAlbum}
                      onChange={(e) => setMoveAlbum(e.target.value)}
                      className="w-full mt-2 px-3 py-2 rounded-lg bg-input border border-border text-sm"
                    >
                      <option value="">No album (will go to Unsorted)</option>
                      {albumsForMove.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  )}
                  {moveCollection && (
                    <button
                      onClick={handleMove}
                      disabled={loading}
                      className="mt-2 w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50"
                    >
                      Move Photo
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Privacy (only for unsorted photos) */}
            {!selectedPhoto?.collection_id && (
              <div>
                <label className="text-sm font-medium text-foreground">Privacy</label>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handlePrivacyChange('private')}
                    disabled={loading}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm disabled:opacity-50',
                      selectedPhoto?.privacy === 'private'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Lock className="w-4 h-4" />
                    Private
                  </button>
                  <button
                    onClick={() => handlePrivacyChange('public')}
                    disabled={loading}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm disabled:opacity-50',
                      selectedPhoto?.privacy === 'public'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Globe className="w-4 h-4" />
                    Public
                  </button>
                </div>
              </div>
            )}

            {/* Delete */}
            <div>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
                Delete Photo
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPhoto?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
