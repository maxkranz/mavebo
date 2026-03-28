import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CollectionClient from '@/components/gallery/collection-client'
import type { Collection, Album } from '@/lib/types'

interface PageProps {
  params: Promise<{ collection_Id: string }>
}

export default async function CollectionPage({ params }: PageProps) {
  const { collection_Id } = await params
  const supabase = await createClient()

  // Получаем текущего пользователя
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    notFound()
  }

  // Загружаем коллекцию
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select('*')
    .eq('id', collection_Id)
    .eq('user_id', user.id)
    .single()

  if (collectionError || !collection) {
    console.error('Collection not found:', collectionError)
    notFound()
  }

  // Загружаем альбомы для этой коллекции
  const { data: albums, error: albumsError } = await supabase
    .from('albums')
    .select('*')
    .eq('collection_id', collection_Id)
    .order('sort_order', { ascending: true })

  if (albumsError) {
    console.error('Error loading albums:', albumsError)
  }

  // Загружаем фото для каждого альбома
  const albumsWithPhotos = await Promise.all(
    (albums || []).map(async (album) => {
      const { data: photos } = await supabase
        .from('photos')
        .select(`
          *,
          profile:profiles(id, name, username, avatar_url)
        `)
        .eq('album_id', album.id)
        .order('created_at', { ascending: false })

      return {
        ...album,
        photos: photos || []
      }
    })
  )

  return (
    <main className="px-4 pt-6 pb-4 max-w-6xl mx-auto">
      <CollectionClient
        collection={collection}
        initialAlbums={albumsWithPhotos}
      />
    </main>
  )
}
