import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import CollectionClient from '@/components/gallery/collection-client'
import type { Collection, Album, Photo } from '@/lib/types'

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
  const { data: rawCollection, error: collectionError } = await supabase
    .from('collections')
    .select('*')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .single()

  if (collectionError || !rawCollection) {
    console.error('Collection not found:', collectionError)
    notFound()
  }

  // Приводим коллекцию к правильному типу (без лишних полей)
  const collection: Collection = {
    id: rawCollection.id,
    name: rawCollection.name,
    privacy: rawCollection.privacy,
    user_id: rawCollection.user_id,
    sort_order: rawCollection.sort_order,
    created_at: rawCollection.created_at,
    updated_at: rawCollection.updated_at,
    cover_url: rawCollection.cover_url || null
  }

  // Загружаем альбомы
  const { data: rawAlbums } = await supabase
    .from('albums')
    .select('*')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: true })

  // Загружаем фото для каждого альбома и сразу приводим к нужному типу
  const albumsWithPhotos = await Promise.all(
    (rawAlbums || []).map(async (rawAlbum) => {
      const { data: rawPhotos } = await supabase
        .from('photos')
        .select(`
          *,
          profile:profiles(id, name, username, avatar_url)
        `)
        .eq('album_id', rawAlbum.id)
        .order('created_at', { ascending: false })

      // Приводим фото к правильному типу
      const photos: Photo[] = (rawPhotos || []).map(photo => ({
        id: photo.id,
        name: photo.name,
        url: photo.url,
        privacy: photo.privacy,
        user_id: photo.user_id,
        collection_id: photo.collection_id,
        album_id: photo.album_id,
        created_at: photo.created_at,
        updated_at: photo.updated_at,
        is_liked: false,
        likes_count: photo.likes_count || 0,
        profile: photo.profile
      }))

      // Приводим альбом к правильному типу
      const album: Album = {
        id: rawAlbum.id,
        name: rawAlbum.name,
        collection_id: rawAlbum.collection_id,
        user_id: rawAlbum.user_id,
        privacy: rawAlbum.privacy,
        sort_order: rawAlbum.sort_order,
        created_at: rawAlbum.created_at,
        updated_at: rawAlbum.updated_at,
        photos: photos
      }

      return album
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
