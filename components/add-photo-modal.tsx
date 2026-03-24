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
  collectionId: string
  albumId: string
}

interface AddPhotoModalProps {
  onClose: () => void
  onBack: () => void
  preselectedCollection?: Collection
  preselectedAlbum?: Album
}

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
  const [photo, setPhoto] = useState<PhotoEntry | null>(null)
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
      
      // Если есть preselectedCollection, загружаем альбомы для него
      if (preselectedCollection?.id) {
        loadAlbums(preselectedCollection.id)
      }
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

  function addFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    
    // Если уже есть фото, удаляем старое и создаем новое
    if (photo) {
      URL.revokeObjectURL(photo.preview)
    }

    const defaultCollectionId = preselectedCollection?.id ?? collections[0]?.id ?? ''
    const defaultAlbumId = preselectedAlbum?.id ?? ''

    const newPhoto: PhotoEntry = {
      file,
      preview: URL.createObjectURL(file),
      name: file.name.replace(/\.[^/.]+$/, ''),
      collectionId: defaultCollectionId,
      albumId: defaultAlbumId,
    }

    setPhoto(newPhoto)
    setError(null)
    
    // Загружаем альбомы для выбранной коллекции
    if (defaultCollectionId) loadAlbums(defaultCollectionId)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        addFile(files[0]) // Берем только первый файл
      }
    },
    [collections],
  )

  function updatePhoto(updates: Partial<PhotoEntry>) {
    if (!photo) return
    setPhoto({ ...photo, ...updates })
    if (updates.collectionId) loadAlbums(updates.collectionId)
  }

  function removePhoto() {
    if (photo) {
      URL.revokeObjectURL(photo.preview)
      setPhoto(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!photo) { 
      setError('Please select a photo to upload.'); 
      return 
    }
    if (!photo.collectionId || !photo.albumId || !photo.name.trim()) { 
      setError('Please fill in all fields.'); 
      return 
    }

    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    // Получаем приватность выбранной коллекции
    const selectedCollection = collections.find(c => c.id === photo.collectionId)
    const privacy = selectedCollection?.privacy || 'private'

    try {
      const ext = photo.file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, photo.file, { upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
      const { error: insertError } = await supabase.from('photos').insert({
        album_id: photo.albumId,
        collection_id: photo.collectionId,
        user_id: user.id,
        name: photo.name.trim(),
        url: urlData.publicUrl,
        privacy: privacy,
      })
      
      if (insertError) throw insertError
      
      setProgress(100)
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 500)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur-sm pb-1 z-10">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-base font-semibold text-foreground">Add Photo</h2>
        <button type="button" onClick={onClose} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

      {/* Drop zone */}
      {!photo && (
        <div
          ref={dropZoneRef}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none',
            dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-muted/40',
          )}
        >
          <Upload className="w-6 h-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            Drop a photo here or click to browse<br />
            <span className="text-xs text-primary">Supports JPG, PNG, GIF</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && e.target.files[0] && addFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Photo entry */}
      {photo && (
        <div className="glass rounded-xl overflow-hidden">
          {/* Preview + remove */}
          <div className="relative h-48 bg-muted">
            <img src={photo.preview} alt={photo.name} className="w-full h-full object-contain bg-black/20" />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              aria-label="Remove photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Photo name"
              value={photo.name}
              onChange={(e) => updatePhoto({ name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Collection</label>
                <select
                  value={photo.collectionId}
                  onChange={(e) => updatePhoto({ collectionId: e.target.value, albumId: '' })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select collection</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Album</label>
                <select
                  value={photo.albumId}
                  onChange={(e) => updatePhoto({ albumId: e.target.value })}
                  required
                  disabled={!photo.collectionId}
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value="">Select album</option>
                  {(albumsMap[photo.collectionId] ?? []).map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Privacy info */}
            {photo.collectionId && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                {collections.find(c => c.id === photo.collectionId)?.privacy === 'public' ? (
                  <>
                    <Globe className="w-3 h-3" />
                    <span>This photo will be <strong className="text-foreground">public</strong> (inherited from collection "{collections.find(c => c.id === photo.collectionId)?.name}")</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>This photo will be <strong className="text-foreground">private</strong> (inherited from collection "{collections.find(c => c.id === photo.collectionId)?.name}")</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress */}
      {loading && (
        <div className="space-y-2">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">Uploading... {progress}%</p>
        </div>
      )}

      {photo && (
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60 sticky bottom-0"
        >
          {loading ? `Uploading... ${progress}%` : `Upload Photo`}
        </button>
      )}
    </form>
  )
}
