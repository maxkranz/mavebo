import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from '@/components/admin/admin-client'

export default async function AdminPage() {
  const supabase = await createClient()
  
  // Получаем текущего пользователя
  const { data: { user } } = await supabase.auth.getUser()
  
  // Если пользователь не авторизован - редирект на логин
  if (!user) redirect('/auth/login')

  // Получаем профиль пользователя
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_admin')
    .eq('id', user.id)
    .single()

  // Проверяем, что username === 'mavebo'
  if (!profile || profile.username !== 'mavebo') {
    redirect('/feed')
  }

  // Fetch all public photos with profile + album + collection info
  const { data: photosRaw } = await supabase
    .from('photos')
    .select(`
      *,
      profile:profiles(id, name, username, avatar_url, badges),
      album:albums(name),
      collection:collections(name)
    `)
    .eq('privacy', 'public')
    .order('created_at', { ascending: false })
    .limit(200)

  const photos = (photosRaw ?? []).map((p: any) => ({
    ...p,
    album_name: p.album?.name ?? '',
    collection_name: p.collection?.name ?? '',
  }))

  // Fetch all collections
  const { data: collectionsRaw } = await supabase
    .from('collections')
    .select(`*, profile:profiles(id, name, username, avatar_url)`)
    .order('created_at', { ascending: false })
    .limit(200)

  const collections = collectionsRaw ?? []

  // Fetch all albums
  const { data: albumsRaw } = await supabase
    .from('albums')
    .select(`*, profile:profiles(id, name, username, avatar_url), collection:collections(name)`)
    .order('created_at', { ascending: false })
    .limit(200)

  const albums = (albumsRaw ?? []).map((a: any) => ({
    ...a,
    collection_name: a.collection?.name ?? '',
  }))

  // Fetch all comments
  const { data: commentsRaw } = await supabase
    .from('comments')
    .select(`*, profile:profiles(id, name, username, avatar_url), photo:photos(name)`)
    .order('created_at', { ascending: false })
    .limit(200)

  const comments = (commentsRaw ?? []).map((c: any) => ({
    ...c,
    photo_name: c.photo?.name ?? '',
  }))

  // Fetch all profiles for badge management
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <AdminClient
      data={{
        photos,
        collections,
        albums,
        comments,
        profiles: profiles ?? [],
      }}
    />
  )
}
