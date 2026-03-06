import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FollowingPageClient from '@/components/following/following-client'

interface Props {
  searchParams: Promise<{ tab?: string }>
}

export default async function FollowingPage({ searchParams }: Props) {
  const { tab } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // People this user follows
  const { data: followingData } = await supabase
    .from('follows')
    .select('following:profiles!follows_following_id_fkey(id, name, username, avatar_url, badges)')
    .eq('follower_id', user.id)

  // People who follow this user
  const { data: followersData } = await supabase
    .from('follows')
    .select('follower:profiles!follows_follower_id_fkey(id, name, username, avatar_url, badges)')
    .eq('following_id', user.id)

  const following = (followingData ?? []).map((r: any) => r.following).filter(Boolean)
  const followers = (followersData ?? []).map((r: any) => r.follower).filter(Boolean)

  return (
    <FollowingPageClient
      following={following}
      followers={followers}
      currentUserId={user.id}
      initialTab={(tab === 'followers' ? 'followers' : 'following') as 'following' | 'followers'}
    />
  )
}
