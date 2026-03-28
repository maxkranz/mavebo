import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import CollectionClient from '@/components/gallery/collection-client'

interface PageProps {
  params: Promise<{ collectionId: string }>
}

export default async function CollectionPage({ params }: PageProps) {
  const { collectionId } = await params
  const supabase = await createClient()

  // Проверяем авторизацию
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/choose')
  }

  // Загружаем коллекцию
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select('*')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .single()

  if (collectionError || !collection) {
    console.error('Collection not found:', collectionError)
    notFound()
  }

  // Загружаем альбомы
  const { data: albums } = await supabase
    .from('albums')
    .select('*')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: true })

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
