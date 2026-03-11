'use client'

import { useState } from 'react'
import type { Photo } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Heart, Images } from 'lucide-react'
import PhotoViewer from '@/components/photo-viewer'
import Link from 'next/link'

interface Props {
  initialFollowingPhotos: Photo[]
  initialAllPhotos: Photo[]
  userId: string
}

export default function FeedClient({ initialFollowingPhotos, initialAllPhotos, userId }: Props) {
  const supabase = createClient()
  const [followingPhotos, setFollowingPhotos] = useState<Photo[]>(initialFollowingPhotos)
  const [allPhotos, setAllPhotos] = useState<Photo[]>(initialAllPhotos)
  const [showAll, setShowAll] = useState(false)
  const [viewer, setViewer] = useState<Photo | null>(null)

  const photos = showAll ? allPhotos : followingPhotos

  async function toggleLike(photo: Photo, isInAll: boolean) {
    const isLiked = photo.is_liked
    const updater = (prev: Photo[]) =>
      prev.map((p) =>
        p.id === photo.id
          ? { ...p, is_liked: !isLiked, likes_count: (p.likes_count ?? 0) + (isLiked ? -1 : 1) }
          : p,
      )
    setFollowingPhotos(updater)
    setAllPhotos(updater)

    if (isLiked) {
      await supabase.from('likes').delete().eq('photo_id', photo.id).eq('user_id', userId)
    } else {
      await supabase.from('likes').insert({ photo_id: photo.id, user_id: userId })
    }
  }

  if (followingPhotos.length === 0 && !showAll) {
    return (
      <main className="px-4 pt-6 pb-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Feed</h1>
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Images className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No posts from people you follow yet.</p>
          <Link href="/search" className="mt-1 text-sm font-medium text-primary hover:underline">
            Find people to follow
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 pt-6 pb-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Feed</h1>
        {showAll && (
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">All posts</span>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onLike={() => toggleLike(photo, showAll)}
            onOpen={() => setViewer(photo)}
          />
        ))}
      </div>

      {viewer && <PhotoViewer photo={viewer} onClose={() => setViewer(null)} />}
    </main>
  )
}

function PhotoCard({
  photo,
  onLike,
  onOpen,
}: {
  photo: Photo
  onLike: () => void
  onOpen: () => void
}) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <Link href={`/profile/${photo.profile?.username}`} className="flex items-center gap-2.5 px-4 py-3">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
          {photo.profile?.avatar_url ? (
            <img src={photo.profile.avatar_url} alt={photo.profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {photo.profile?.name?.[0] ?? '?'}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">{photo.profile?.name}</p>
          <p className="text-xs text-muted-foreground">@{photo.profile?.username}</p>
        </div>
      </Link>

      <div
        className="w-full bg-muted cursor-pointer"
        style={{ paddingBottom: '75%', position: 'relative' }}
        onClick={onOpen}
      >
        <img
          src={photo.url}
          alt={photo.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="px-4 py-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-4">
          <button
            onClick={onLike}
            className="flex items-center gap-1.5 transition-colors"
            aria-label={photo.is_liked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${photo.is_liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
            />
            <span className={`text-sm ${photo.is_liked ? 'text-red-500' : 'text-muted-foreground'}`}>
              {photo.likes_count ?? 0}
            </span>
          </button>
        </div>
        <p className="text-sm font-semibold text-foreground">{photo.name}</p>
      </div>
    </div>
  )
}
