'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Photo } from '@/lib/types'
import { X, Heart } from 'lucide-react'

interface Props {
  photo: Photo
  onClose: () => void
}

export default function PhotoViewer({ photo, onClose }: Props) {
  const supabase = createClient()
  const [liked, setLiked] = useState(photo.is_liked ?? false)
  const [likesCount, setLikesCount] = useState(photo.likes_count ?? 0)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Load likes status
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('photo_id', photo.id)
        .eq('user_id', user.id)
        .maybeSingle()
      setLiked(!!likeData)

      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('photo_id', photo.id)
      setLikesCount(count ?? 0)
    }
    load()
  }, [photo.id, supabase])

  async function toggleLike() {
    if (!userId) return
    if (liked) {
      await supabase.from('likes').delete().eq('photo_id', photo.id).eq('user_id', userId)
      setLiked(false)
      setLikesCount((n) => Math.max(0, n - 1))
    } else {
      await supabase.from('likes').insert({ photo_id: photo.id, user_id: userId })
      setLiked(true)
      setLikesCount((n) => n + 1)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-md" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] glass rounded-2xl overflow-hidden z-10 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo */}
        <div className="relative">
          <img src={photo.url} alt={photo.name} className="w-full h-auto object-cover" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Photo name overlay */}
          <div className="absolute bottom-3 left-3 right-16">
            <h3 className="text-white font-semibold text-lg drop-shadow-lg">{photo.name}</h3>
          </div>

          {/* Like button */}
          <button
            onClick={toggleLike}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`}
            />
            <span className={`text-sm font-medium ${liked ? 'text-red-500' : 'text-white'}`}>
              {likesCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
