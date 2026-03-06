'use client'

import { useState } from 'react'
import { X, Plus, Images } from 'lucide-react'
import { cn } from '@/lib/utils'
import AddPhotoModal from '@/components/add-photo-modal'
import CreateCollectionModal from '@/components/create-collection-modal'

interface AddModalProps {
  open: boolean
  onClose: () => void
}

export default function AddModal({ open, onClose }: AddModalProps) {
  const [view, setView] = useState<'choice' | 'photo' | 'collection'>('choice')

  function handleClose() {
    onClose()
    setTimeout(() => setView('choice'), 300)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-sm glass rounded-2xl p-6 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {view === 'choice' && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Add</h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setView('photo')}
                className="flex flex-col items-center gap-3 p-5 rounded-xl bg-secondary hover:bg-accent transition-all active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Add Photo</span>
              </button>
              <button
                onClick={() => setView('collection')}
                className="flex flex-col items-center gap-3 p-5 rounded-xl bg-secondary hover:bg-accent transition-all active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Images className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">New Collection</span>
              </button>
            </div>
          </>
        )}
        {view === 'photo' && (
          <AddPhotoModal onClose={handleClose} onBack={() => setView('choice')} />
        )}
        {view === 'collection' && (
          <CreateCollectionModal onClose={handleClose} onBack={() => setView('choice')} />
        )}
      </div>
    </div>
  )
}
