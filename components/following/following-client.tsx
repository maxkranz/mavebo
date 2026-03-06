'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, BadgeType } from '@/lib/types'
import { BadgeCheck, Snowflake, Monitor, Star, UserMinus } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  following: Profile[]
  followers: Profile[]
  currentUserId: string
  initialTab: 'following' | 'followers'
}

const BADGE_CONFIG: Record<BadgeType, { icon: React.ElementType; color: string; label: string }> = {
  verified: { icon: BadgeCheck, color: 'text-blue-500', label: 'Verified' },
  snowflake: { icon: Snowflake, color: 'text-cyan-400', label: 'Snowflake' },
  computer: { icon: Monitor, color: 'text-violet-500', label: 'Computer' },
  star: { icon: Star, color: 'text-amber-400', label: 'Star' },
}

export default function FollowingPageClient({ following, followers, currentUserId, initialTab }: Props) {
  const supabase = createClient()
  const [tab, setTab] = useState<'following' | 'followers'>(initialTab)
  const [followingList, setFollowingList] = useState<Profile[]>(following)
  const [followersList] = useState<Profile[]>(followers)

  async function unfollow(profileId: string) {
    await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', profileId)
    setFollowingList((prev) => prev.filter((p) => p.id !== profileId))
  }

  const list = tab === 'following' ? followingList : followersList

  return (
    <main className="px-4 pt-6 pb-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-5">People</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted mb-5">
        {(['following', 'followers'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t === 'following' ? `Following (${followingList.length})` : `Followers (${followersList.length})`}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-muted-foreground text-sm">
            {tab === 'following' ? "You're not following anyone yet." : "No followers yet."}
          </p>
          {tab === 'following' && (
            <Link href="/search" className="text-sm font-medium text-primary hover:underline">
              Find people to follow
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((profile) => (
            <div key={profile.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <Link href={`/profile/${profile.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {profile.name?.[0] ?? '?'}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-semibold text-foreground truncate">{profile.name}</p>
                    {(profile.badges ?? []).map((badge) => {
                      const cfg = BADGE_CONFIG[badge as BadgeType]
                      if (!cfg) return null
                      const Icon = cfg.icon
                      return <Icon key={badge} className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.color}`} title={cfg.label} />
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
                </div>
              </Link>

              {tab === 'following' && (
                <button
                  onClick={() => unfollow(profile.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-destructive text-xs font-medium transition-colors flex-shrink-0"
                  aria-label={`Unfollow ${profile.name}`}
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  Unfollow
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
