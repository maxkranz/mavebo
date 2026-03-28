'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Photo, Collection, Album } from '@/lib/types'
import { Trash2, Pencil, Check, X, Move, Copy, MoreVertical, Lock, Globe } from 'lucide-react'
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
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Props {
  photos: Photo[]
  onDelete?: (id: string) => void
  onRename?: (id: string, newName: string) => void
  onMove?: (photo: Photo) => void
  onPrivacyChange?: (id: string, privacy: 'private' | 'public') => void
  showActions?: boolean
  collections?: Collection[]
  albumsMap?: Record<string, Album[]>
  isOwn?: boolean
}

export default function PhotoGrid({ 
  photos, 
  onDelete, 
  onRename,
  onMove,
  onPrivacyChange,
  showActions = true,
  collections = [],
  albumsMap = {},
  isOwn = true
}: Props) {
  const supabase = createClient()
  const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [movingPhoto, setMovingPhoto] = useState<Photo | null>(null)
  const [selectedCollection, setSelectedCollection] = useState('')
  const [selectedAlbum, setSelectedAlbum] = useState('')
  const [albumsForCollection, setAlbumsForCollection] = useState<Album[]>([])
  const [deleteDialog, setDeleteDialog] = useState<Photo | null>(null)

  async function rename(photo: Photo) {
    if (!editName.trim()) return
    await supabase.from('photos').update({ name: editName }).eq('id', photo.id)
    if (onRename) onRename(photo.id, editName)
    setEditing(null)
  }

  async function changePrivacy(photo: Photo, privacy: 'private' | 'public') {
    await supabase.from('photos').update({ privacy }).eq('id', photo.id)
    if (onPrivacyChange) onPrivacyChange(photo.id, privacy)
    // Обновляем фото в локальном состоянии
    photo.privacy = privacy
  }

  async function movePhoto() {
    if (!movingPhoto || !selectedCollection) return

    let albumId = selectedAlbum
    if (!albumId && selectedCollection) {
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

    const { error } = await supabase
      .from('photos')
      .update({
        collection_id: selectedCollection,
        album_id: albumId
      })
      .eq('id', movingPhoto.id)

    if (!error && onMove) {
      onMove(movingPhoto)
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

  async function copyLink(photo: Photo) {
    const url = `${window.location.origin}/photo/${photo.id}`
    await navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
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
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all duration-200" />
                
                {/* Menu button (top right) */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-7 h-7 rounded-md bg-black/50 text-white flex items-center justify-center hover:bg-black/70">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass rounded-xl">
                      <DropdownMenuItem onClick={() => { setEditing(photo.id); setEditName(photo.name) }}>
                        <Pencil className="w-4 h-4 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyLink(photo)}>
                        <Copy className="w-4 h-4 mr-2" /> Copy Link
                      </DropdownMenuItem>
                      {onMove && (
                        <DropdownMenuItem onClick={() => setMovingPhoto(photo)}>
                          <Move className="w-4 h-4 mr-2" /> Move to Collection
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => changePrivacy(photo, photo.privacy === 'public' ? 'private' : 'public')}>
                        {photo.privacy === 'public' ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" /> Make Private
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4 mr-2" /> Make Public
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteDialog(photo)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Quick rename inline (bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                  {editing === photo.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 rounded-lg bg-background/90 text-xs text-foreground focus:outline-none"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button onClick={(e) => { e.stopPropagation(); rename(photo) }} className="w-6 h-6 rounded-md bg-primary text-primary-foreground">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setEditing(null) }} className="w-6 h-6 rounded-md bg-muted text-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium text-white truncate flex-1 drop-shadow bg-black/50 px-1.5 py-0.5 rounded">
                        {photo.name}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Photo Viewer Modal */}
      {viewerPhoto && (
        <PhotoViewer photo={viewerPhoto} onClose={() => setViewerPhoto(null)} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog !== null} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog ? `Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.` : 'Are you sure you want to delete this photo?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteDialog && onDelete) onDelete(deleteDialog.id)
                setDeleteDialog(null)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move Photo Dialog */}
      <AlertDialog open={movingPhoto !== null} onOpenChange={() => setMovingPhoto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Collection</AlertDialogTitle>
            <AlertDialogDescription>
              {movingPhoto ? `Choose a collection and album for "${movingPhoto.name}".` : 'Choose a collection for this photo.'}
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={movePhoto} disabled={!selectedCollection}>
              Move
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
