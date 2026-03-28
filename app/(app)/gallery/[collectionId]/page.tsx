'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Collection, Album, Photo, Privacy } from '@/lib/types'
import { Lock, Globe, Pencil, Trash2, Check, X, Plus, MoreVertical, Move, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import PhotoGrid from '@/components/gallery/photo-grid'
import AddPhotoModal from '@/components/add-photo-modal'
import { useRouter } from 'next/navigation'
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

const privacyOpts: { value: Privacy; icon: React.ElementType; label: string }[] = [
  { value: 'private', icon: Lock, label: 'Private' },
  { value: 'public', icon: Globe, label: 'Public' },
]

interface Props {
  collection: Collection
  initialAlbums?: Album[]
  unsortedPhotos?: Photo[]
}

export default function CollectionClient({ collection, initialAlbums = [], unsortedPhotos = [] }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [albums, setAlbums] = useState<Album[]>(initialAlbums)
  const [activeAlbum, setActiveAlbum] = useState<string>(initialAlbums[0]?.id ?? '')
  const [addPhotoOpen, setAddPhotoOpen] = useState(false)
  const [deletingCollection, setDeletingCollection] = useState(false)
  const [editingCollection, setEditingCollection] = useState(false)
  const [collectionName, setCollectionName] = useState(collection?.name ?? '')
  const [editingAlbum, setEditingAlbum] = useState<string | null>(null)
  const [editAlbumName, setEditAlbumName] = useState('')
  const [creatingAlbum, setCreatingAlbum] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{ type: 'photo' | 'album' | 'collection'; id: string; name: string } | null>(null)
  const [movePhotoDialog, setMovePhotoDialog] = useState<{ photo: Photo | null; open: boolean }>({ photo: null, open: false })
  const [allCollections, setAllCollections] = useState<Collection[]>([])
  const [albumsForMove, setAlbumsForMove] = useState<Album[]>([])
  const [selectedMoveCollection, setSelectedMoveCollection] = useState('')
  const [selectedMoveAlbum, setSelectedMoveAlbum] = useState('')

  const activeAlbumData = albums.find((a) => a.id === activeAlbum)

  // Загружаем все коллекции для перемещения
  useEffect(() => {
    async function loadCollections() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order')
      setAllCollections(data ?? [])
    }
    loadCollections()
  }, [])

  async function renameCollection() {
    if (!collectionName.trim()) return
    await supabase
      .from('collections')
      .update({ name: collectionName })
      .eq('id', collection.id)
    setEditingCollection(false)
    router.refresh()
  }

  async function createAlbum() {
    if (!newAlbumName.trim()) return
    const { data, error } = await supabase
      .from('albums')
      .insert({
        collection_id: collection.id,
        name: newAlbumName,
        privacy: collection.privacy,
        sort_order: albums.length
      })
      .select()
      .single()
    
    if (!error && data) {
      setAlbums([...albums, data])
      setActiveAlbum(data.id)
    }
    setCreatingAlbum(false)
    setNewAlbumName('')
  }

  async function renameAlbum(albumId: string) {
    if (!editAlbumName.trim()) return
    await supabase
      .from('albums')
      .update({ name: editAlbumName })
      .eq('id', albumId)
    setAlbums(prev => prev.map(a => a.id === albumId ? { ...a, name: editAlbumName } : a))
    setEditingAlbum(null)
  }

  async function deleteAlbum(albumId: string) {
    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('id', albumId)
    
    if (!error) {
      const next = albums.filter(a => a.id !== albumId)
      setAlbums(next)
      if (activeAlbum === albumId) setActiveAlbum(next[0]?.id ?? '')
    }
    setDeleteDialog(null)
  }

  async function deletePhoto(photoId: string) {
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
    
    if (!error) {
      setAlbums(prev =>
        prev.map(a => ({
          ...a,
          photos: (a.photos ?? []).filter((p: Photo) => p.id !== photoId)
        }))
      )
    }
    setDeleteDialog(null)
  }

  async function deleteCollection() {
    setDeletingCollection(true)
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collection.id)
    if (error) {
      alert(error.message)
      setDeletingCollection(false)
      return
    }
    router.push('/gallery')
    router.refresh()
  }

  async function changeAlbumPrivacy(albumId: string, privacy: Privacy) {
    await supabase
      .from('albums')
      .update({ privacy })
      .eq('id', albumId)
    setAlbums(prev => prev.map(a => a.id === albumId ? { ...a, privacy } : a))
  }

  async function movePhoto() {
    if (!movePhotoDialog.photo || !selectedMoveCollection) return

    let albumId = selectedMoveAlbum
    if (!albumId && selectedMoveCollection) {
      // Проверяем, есть ли альбом "Unsorted" в выбранной коллекции
      const { data: existingAlbum } = await supabase
        .from('albums')
        .select('id')
        .eq('collection_id', selectedMoveCollection)
        .eq('name', 'Unsorted')
        .maybeSingle()

      if (existingAlbum) {
        albumId = existingAlbum.id
      } else {
        const { data: newAlbum } = await supabase
          .from('albums')
          .insert({
            collection_id: selectedMoveCollection,
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
        collection_id: selectedMoveCollection,
        album_id: albumId
      })
      .eq('id', movePhotoDialog.photo.id)

    if (!error) {
      // Удаляем фото из текущего альбома
      setAlbums(prev =>
        prev.map(a => ({
          ...a,
          photos: (a.photos ?? []).filter((p: Photo) => p.id !== movePhotoDialog.photo.id)
        }))
      )
    }

    setMovePhotoDialog({ photo: null, open: false })
    setSelectedMoveCollection('')
    setSelectedMoveAlbum('')
    setAlbumsForMove([])
  }

  function handleMoveCollectionChange(collectionId: string) {
    setSelectedMoveCollection(collectionId)
    setSelectedMoveAlbum('')
    const collection = allCollections.find(c => c.id === collectionId)
    if (collection) {
      // Загружаем альбомы этой коллекции
      supabase
        .from('albums')
        .select('*')
        .eq('collection_id', collectionId)
        .then(({ data }) => setAlbumsForMove(data ?? []))
    }
  }

  // Если нет альбомов, показываем пустое состояние
  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Collection not found</p>
      </div>
    )
  }

  if (albums.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">{collection.name}</h1>
            <button
              onClick={() => setEditingCollection(true)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass rounded-xl">
              <DropdownMenuItem onClick={() => setDeleteDialog({ type: 'collection', id: collection.id, name: collection.name })} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Collection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">No albums in this collection yet.</p>
            <button
              onClick={() => setCreatingAlbum(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create first album
            </button>
          </div>
        </div>

        {creatingAlbum && (
          <div className="flex items-center gap-2 justify-center">
            <input
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              placeholder="Album name"
              className="px-3 py-2 rounded-xl bg-input border border-border text-sm"
              autoFocus
            />
            <button onClick={createAlbum} className="w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setCreatingAlbum(false)} className="w-8 h-8 rounded-lg bg-muted text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Edit collection dialog */}
        {editingCollection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="glass rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Rename Collection</h3>
              <input
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={renameCollection} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground">Save</button>
                <button onClick={() => setEditingCollection(false)} className="flex-1 py-2 rounded-lg bg-muted">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation dialog */}
        <AlertDialog open={deleteDialog !== null} onOpenChange={() => setDeleteDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {deleteDialog?.type}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteDialog?.type === 'collection' && `Are you sure you want to delete the collection "${deleteDialog.name}" and all its albums and photos? This action cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteDialog?.type === 'collection') deleteCollection()
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Collection header with edit */}
      <div className="flex items-center justify-between">
        {editingCollection ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-input border border-border text-lg font-semibold"
              autoFocus
            />
            <button onClick={renameCollection} className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setEditingCollection(false)} className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">{collection.name}</h1>
            <button
              onClick={() => setEditingCollection(true)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass rounded-xl">
            <DropdownMenuItem onClick={() => setDeleteDialog({ type: 'collection', id: collection.id, name: collection.name })} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Collection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Albums section */}
      <div className="flex flex-wrap items-center gap-2">
        {albums.map((album) => (
          <div key={album.id} className="relative group">
            <button
              onClick={() => setActiveAlbum(album.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                activeAlbum === album.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {album.name}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <MoreVertical className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="glass rounded-xl">
                <DropdownMenuItem onClick={() => { setEditingAlbum(album.id); setEditAlbumName(album.name) }}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteDialog({ type: 'album', id: album.id, name: album.name })} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Album
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        
        {creatingAlbum ? (
          <div className="flex items-center gap-2">
            <input
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              placeholder="Album name"
              className="px-3 py-2 rounded-xl bg-input border border-border text-sm"
              autoFocus
            />
            <button onClick={createAlbum} className="w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setCreatingAlbum(false)} className="w-8 h-8 rounded-lg bg-muted text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreatingAlbum(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            New Album
          </button>
        )}
      </div>

      {/* Active album controls */}
      {activeAlbumData && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          {editingAlbum === activeAlbumData.id ? (
            <div className="flex items-center gap-2">
              <input
                value={editAlbumName}
                onChange={(e) => setEditAlbumName(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-input border border-border text-sm"
                autoFocus
              />
              <button onClick={() => renameAlbum(activeAlbumData.id)} className="w-7 h-7 rounded-lg bg-primary text-primary-foreground">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditingAlbum(null)} className="w-7 h-7 rounded-lg bg-muted text-muted-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{activeAlbumData.name}</span>
              <button
                onClick={() => { setEditingAlbum(activeAlbumData.id); setEditAlbumName(activeAlbumData.name) }}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Privacy toggle */}
            <div className="flex gap-1">
              {privacyOpts.map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => changeAlbumPrivacy(activeAlbumData.id, value)}
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                    activeAlbumData.privacy === value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                  title={value}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setAddPhotoOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
            >
              <Plus className="w-3 h-3" /> Add Photo
            </button>
          </div>
        </div>
      )}

      {/* Photos grid */}
      {activeAlbumData && activeAlbumData.photos && (
        <PhotoGrid
          photos={activeAlbumData.photos as Photo[]}
          onDelete={(id) => setDeleteDialog({ type: 'photo', id, name: '' })}
          collections={allCollections}
        />
      )}

      {/* Add photo modal */}
      {addPhotoOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setAddPhotoOpen(false)}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm glass rounded-2xl p-6 z-10" onClick={(e) => e.stopPropagation()}>
            <AddPhotoModal
              onClose={() => setAddPhotoOpen(false)}
              onBack={() => setAddPhotoOpen(false)}
              preselectedCollection={collection}
              preselectedAlbum={activeAlbumData}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialog !== null} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteDialog?.type}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog?.type === 'photo' 
                ? 'Are you sure you want to delete this photo? This action cannot be undone.'
                : deleteDialog?.type === 'album'
                ? `Are you sure you want to delete "${deleteDialog.name}" and all its photos? This action cannot be undone.`
                : `Are you sure you want to delete the collection "${deleteDialog.name}" and all its albums and photos? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog?.type === 'photo') deletePhoto(deleteDialog.id)
                if (deleteDialog?.type === 'album') deleteAlbum(deleteDialog.id)
                if (deleteDialog?.type === 'collection') deleteCollection()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move photo dialog */}
      <AlertDialog open={movePhotoDialog.open} onOpenChange={() => setMovePhotoDialog({ photo: null, open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Choose a collection and album for "{movePhotoDialog.photo?.name ?? 'this photo'}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Collection</label>
              <select
                value={selectedMoveCollection}
                onChange={(e) => handleMoveCollectionChange(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-input border border-border text-sm"
              >
                <option value="">Select collection</option>
                {allCollections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {selectedMoveCollection && (
              <div>
                <label className="text-sm font-medium">Album (optional)</label>
                <select
                  value={selectedMoveAlbum}
                  onChange={(e) => setSelectedMoveAlbum(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-input border border-border text-sm"
                >
                  <option value="">No album (will go to Unsorted)</option>
                  {albumsForMove.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={movePhoto} disabled={!selectedMoveCollection}>
              Move
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
