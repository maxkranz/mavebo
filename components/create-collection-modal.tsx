'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, X, Plus, Trash2, Lock, Globe } from 'lucide-react'
import type { Privacy } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CreateCollectionModalProps {
  onClose: () => void
  onBack: () => void
}

const privacyOptions: { value: Privacy; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'private', label: 'Private', icon: Lock, desc: 'Only you' },
  { value: 'public', label: 'Public', icon: Globe, desc: 'Everyone' },
]

export default function CreateCollectionModal({ onClose, onBack }: CreateCollectionModalProps) {
  const supabase = createClient()
  const [collectionName, setCollectionName] = useState('')
  const [privacy, setPrivacy] = useState<Privacy>('private')
  const [albums, setAlbums] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addAlbum() {
    setAlbums([...albums, ''])
  }

  function removeAlbum(i: number) {
    setAlbums(albums.filter((_, idx) => idx !== i))
  }

  function updateAlbum(i: number, val: string) {
    const next = [...albums]
    next[i] = val
    setAlbums(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const albumNames = albums.map((a) => a.trim()).filter(Boolean)
    if (!collectionName.trim()) { setError('Collection name is required.'); return }
    if (albumNames.length === 0) { setError('Add at least one album.'); return }
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: col, error: colError } = await supabase
      .from('collections')
      .insert({ user_id: user.id, name: collectionName.trim(), privacy })
      .select()
      .single()

    if (colError || !col) {
      setError(colError?.message ?? 'Failed to create collection.')
      setLoading(false)
      return
    }

    const albumRows = albumNames.map((name, i) => ({
      collection_id: col.id,
      user_id: user.id,
      name,
      privacy,
      sort_order: i,
    }))

    const { error: albumError } = await supabase.from('albums').insert(albumRows)
    if (albumError) {
      setError(albumError.message)
      setLoading(false)
      return
    }

    onClose()
    window.location.reload()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-1">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-base font-semibold text-foreground">New Collection</h2>
        <button type="button" onClick={onClose} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

      <input
        type="text"
        placeholder="Collection name"
        value={collectionName}
        onChange={(e) => setCollectionName(e.target.value)}
        required
        className="w-full px-3 py-2.5 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {/* Privacy */}
      <div className="flex gap-2">
        {privacyOptions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setPrivacy(value)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all',
              privacy === value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Albums */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Albums</p>
        {albums.map((album, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              placeholder={`Album ${i + 1} name`}
              value={album}
              onChange={(e) => updateAlbum(i, e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {albums.length > 1 && (
              <button
                type="button"
                onClick={() => removeAlbum(i)}
                className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addAlbum}
          className="flex items-center gap-1.5 text-xs text-primary font-medium py-1 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Add album
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60"
      >
        {loading ? 'Creating...' : 'Create Collection'}
      </button>
    </form>
  )
}
