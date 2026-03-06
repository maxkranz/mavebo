import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProfileView from '@/components/profile/profile-view'

interface Props {
  params: Promise<{ username: string }>
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const isOwn = user?.id === profile.id

  const [
    { count: followersCount },
    { count: followingCount },
    followResult,
    photosResult,
  ] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    user
      ? supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', profile.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('photos')
      .select('*')
      .eq('user_id', profile.id)
      .in('privacy', isOwn ? ['private', 'followers', 'public'] : ['public', 'followers'])
      .order('created_at', { ascending: false })
      .limit(60),
  ])

  const enrichedProfile = {
    ...profile,
    followers_count: followersCount ?? 0,
    following_count: followingCount ?? 0,
    is_following: !!followResult.data,
  }

  return (
    <ProfileView
      profile={enrichedProfile}
      photos={(photosResult.data ?? []) as any}
      isOwn={isOwn}
      currentUserId={user?.id ?? null}
    />
  )
}
