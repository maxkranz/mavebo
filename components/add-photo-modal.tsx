'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Upload, Lock, Globe, X, Trash2 } from 'lucide-react'
import type { Collection, Album, Privacy } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PhotoEntry {
  file: File
  preview: string
  name: string
  privacy: Privacy
  collectionId: string
  albumId: string
}

interface AddPhotoModalProps {
  onClose: () => void
  onBack: () => void
  preselectedCollection?: Collection
  preselectedAlbum?: Album
}

const privacyOptions: { value: Privacy; label: string; icon: React.ElementType }[] = [
  { value: 'private', label: 'Private', icon: Lock },
  { value: 'public', label: 'Public', icon: Globe },
]

const MAX_PHOTOS = 10

export default function AddPhotoModal({
  onClose,
  onBack,
  preselectedCollection,
  preselectedAlbum,
}: AddPhotoModalProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const [collections, setCollections] = useState<Collection[]>([])
  const [albumsMap, setAlbumsMap] = useState<Record<string, Album[]>>({})
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order')
      setCollections(data ?? [])
    }
    load()
  }, [])

  async function loadAlbums(collectionId: string) {
    if (albumsMap[collectionId]) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('albums')
      .select('*')
      .eq('collection_id', collectionId)
      .eq('user_id', user.id)
      .order('sort_order')
    setAlbumsMap((prev) => ({ ...prev, [collectionId]: data ?? [] }))
  }

  function addFiles(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    const remaining = MAX_PHOTOS - photos.length
    const toAdd = imageFiles.slice(0, remaining)
    if (toAdd.length === 0) return

    const defaultCollectionId = preselectedCollection?.id ?? collections[0]?.id ?? ''
    const defaultAlbumId = preselectedAlbum?.id ?? ''
    const defaultPrivacy: Privacy = 'private'

    const entries: PhotoEntry[] = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name.replace(/\.[^/.]+$/, ''),
      privacy: defaultPrivacy,
      collectionId: defaultCollectionId,
      albumId: defaultAlbumId,
    }))

    setPhotos((prev) => [...prev, ...entries])

    // preload albums for default collection
    if (defaultCollectionId) loadAlbums(defaultCollectionId)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      addFiles(files)
    },
    [photos.length, collections],
  )

  function updatePhoto(index: number, updates: Partial<PhotoEntry>) {
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, ...updates } : p)))
    if (updates.collectionId) loadAlbums(updates.collectionId)
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (photos.length === 0) { setError('Add at least one photo.'); return }
    const invalid = photos.find((p) => !p.collectionId || !p.albumId || !p.name.trim())
    if (invalid) { setError('Each photo needs a name, collection, and album.'); return }

    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let uploaded = 0
    for (const photo of photos) {
      const ext = photo.file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, photo.file, { upsert: false })

      if (uploadError) { setError(uploadError.message); setLoading(false); return }

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
      const { error: insertError } = await supabase.from('photos').insert({
        album_id: photo.albumId,
        collection_id: photo.collectionId,
        user_id: user.id,
        name: photo.name.trim(),
        url: urlData.publicUrl,
        privacy: photo.privacy,
      })
      if (insertError) { setError(insertError.message); setLoading(false); return }
      uploaded++
      setProgress(Math.round((uploaded / photos.length) * 100))
    }

    onClose()
    window.location.reload()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur-sm pb-1 z-10">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-base font-semibold text-foreground">Add Photos</h2>
        <button type="button" onClick={onClose} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

      {/* Drop zone */}
      {photos.length < MAX_PHOTOS && (
        <div
          ref={dropZoneRef}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none',
            dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-muted/40',
          )}
        >
          <Upload className="w-5 h-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Drop photos here or click to browse<br />
            <span className="text-primary font-medium">{photos.length}/{MAX_PHOTOS} selected</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
          />
        </div>
      )}

      {/* Per-photo entries */}
      {photos.map((photo, i) => (
        <div key={i} className="glass rounded-xl overflow-hidden">
          {/* Thumbnail + remove */}
          <div className="relative h-24 bg-muted">
            <img src={photo.preview} alt={photo.name} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label="Remove photo"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <div className="p-3 flex flex-col gap-2">
            <input
              type="text"
              placeholder="Photo name"
              value={photo.name}
              onChange={(e) => updatePhoto(i, { name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2">
              <select
                value={photo.collectionId}
                onChange={(e) => updatePhoto(i, { collectionId: e.target.value, albumId: '' })}
                required
                className="flex-1 px-2 py-2 rounded-lg bg-input border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Collection</option>
                {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select
                value={photo.albumId}
                onChange={(e) => updatePhoto(i, { albumId: e.target.value })}
                required
                disabled={!photo.collectionId}
                className="flex-1 px-2 py-2 rounded-lg bg-input border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                <option value="">Album</option>
                {(albumsMap[photo.collectionId] ?? []).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              {privacyOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updatePhoto(i, { privacy: value })}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-medium transition-all',
                    photo.privacy === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Progress */}
      {loading && (
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {photos.length > 0 && (
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60 sticky bottom-0"
        >
          {loading ? `Uploading... ${progress}%` : `Upload ${photos.length} Photo${photos.length > 1 ? 's' : ''}`}
        </button>
      )}
    </form>
  )
}
