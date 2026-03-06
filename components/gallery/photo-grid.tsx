'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Photo } from '@/lib/types'
import { Trash2, Lock, Users, Globe, Pencil, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import PhotoViewer from '@/components/photo-viewer'

interface Props {
  photos: Photo[]
  onDelete?: (id: string) => void
  showActions?: boolean
}

export default function PhotoGrid({ photos, onDelete, showActions = true }: Props) {
  const supabase = createClient()
  const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function rename(photo: Photo) {
    if (!editName.trim()) return
    await supabase.from('photos').update({ name: editName }).eq('id', photo.id)
    photo.name = editName
    setEditing(null)
  }

  if (photos.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No photos in this album yet.
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
                        {onDelete && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(photo.id) }}
                            className="w-6 h-6 rounded-md bg-background/70 text-foreground flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
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
