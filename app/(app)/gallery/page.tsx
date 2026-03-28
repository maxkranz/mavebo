import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Lock, Globe, Images, Image, Plus } from 'lucide-react'
import type { Collection, Photo } from '@/lib/types'
import PhotoGrid from '@/components/gallery/photo-grid'

const privacyIcon = { private: Lock, public: Globe }
const privacyColor = { private: 'text-muted-foreground', public: 'text-green-500' }

export default async function GalleryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Загружаем коллекции
  const { data: collections } = await supabase
    .from('collections')
    .select('*, albums(count), photos(count)')
    .eq('user_id', user!.id)
    .order('sort_order')

  // Загружаем несортированные фото
  const { data: unsortedPhotos } = await supabase
    .from('photos')
    .select(`
      *,
      profile:profiles(id, name, username, avatar_url)
    `)
    .is('collection_id', null)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  // Получаем лайки для несортированных фото
  let photosWithLikes: Photo[] = []
  if (unsortedPhotos && unsortedPhotos.length > 0) {
    const { data: likes } = await supabase
      .from('likes')
      .select('photo_id')
      .eq('user_id', user!.id)

    const likedPhotoIds = new Set(likes?.map(l => l.photo_id) || [])

    photosWithLikes = unsortedPhotos.map(photo => ({
      ...photo,
      is_liked: likedPhotoIds.has(photo.id),
      likes_count: photo.likes_count || 0
    }))
  }

  const hasUnsorted = photosWithLikes.length > 0
  const hasCollections = collections && collections.length > 0

  return (
    <main className="px-4 pt-6 pb-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Gallery</h1>
        <div className="flex gap-2">
          <Link
            href="/add"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Photo
          </Link>
        </div>
      </div>

      {/* Unsorted Photos Section */}
      {hasUnsorted && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Unsorted Photos</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {photosWithLikes.length}
            </span>
          </div>
          <PhotoGrid
            photos={photosWithLikes}
            showActions={true}
          />
        </div>
      )}

      {/* Collections Section */}
      {!hasCollections && !hasUnsorted ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Images className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No collections or photos yet.</p>
          <p className="text-muted-foreground text-xs">Tap the + button to add your first photo or create a collection.</p>
        </div>
      ) : hasCollections ? (
        <>
          <h2 className="text-lg font-semibold text-foreground mb-4">Collections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(collections as any[]).map((col) => {
              const Icon = privacyIcon[col.privacy as keyof typeof privacyIcon] ?? Lock
              const color = privacyColor[col.privacy as keyof typeof privacyColor] ?? 'text-muted-foreground'
              return (
                <Link
                  key={col.id}
                  href={`/gallery/${col.id}`}
                  className="glass rounded-2xl overflow-hidden hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                >
                  {/* Cover */}
                  <div className="h-36 bg-muted/50 relative">
                    {col.cover_url ? (
                      <img src={col.cover_url} alt={col.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Images className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{col.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {col.albums?.[0]?.count ?? 0} albums
                      </p>
                    </div>
                    <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} />
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      ) : null}
    </main>
  )
}
