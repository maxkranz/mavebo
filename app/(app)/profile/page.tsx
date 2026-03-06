import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileView from '@/components/profile/profile-view'

export default async function MyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', user.id)

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', user.id)

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', user.id)
    .in('privacy', ['public', 'followers'])
    .order('created_at', { ascending: false })
    .limit(60)

  const enrichedProfile = {
    ...profile,
    followers_count: followersCount ?? 0,
    following_count: followingCount ?? 0,
    is_following: false,
  }

  return (
    <ProfileView
      profile={enrichedProfile}
      photos={(photos ?? []) as any}
      isOwn={true}
      currentUserId={user.id}
    />
  )
}
