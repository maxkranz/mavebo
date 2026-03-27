'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Photo, BadgeType } from '@/lib/types'
import { UserPlus, UserCheck, Images, BadgeCheck, Snowflake, Monitor, Star, Settings } from 'lucide-react'
import PhotoViewer from '@/components/photo-viewer'
import Link from 'next/link'

interface Props {
  profile: Profile
  photos: Photo[]
  isOwn: boolean
  currentUserId: string | null
}

const BADGE_CONFIG: Record<BadgeType, { icon: React.ElementType; color: string; label: string }> = {
  verified: { icon: BadgeCheck, color: 'text-blue-500', label: 'Verified' },
  snowflake: { icon: Snowflake, color: 'text-cyan-400', label: 'Snowflake' },
  computer: { icon: Monitor, color: 'text-violet-500', label: 'Computer' },
  star: { icon: Star, color: 'text-amber-400', label: 'Star' },
}

export default function ProfileView({ profile, photos, isOwn, currentUserId }: Props) {
  const supabase = createClient()
  const [following, setFollowing] = useState(profile.is_following ?? false)
  const [followersCount, setFollowersCount] = useState(profile.followers_count ?? 0)
  const [viewer, setViewer] = useState<Photo | null>(null)

  async function toggleFollow() {
    if (!currentUserId) return
    if (following) {
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', profile.id)
      setFollowing(false)
      setFollowersCount((n) => Math.max(0, n - 1))
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: profile.id })
      setFollowing(true)
      setFollowersCount((n) => n + 1)
    }
  }

  const badges: BadgeType[] = profile.badges ?? []

  return (
    <main className="px-4 pt-6 pb-4 max-w-xl mx-auto">
      {/* Profile header */}
      <div className="glass rounded-2xl p-5 mb-5 flex flex-col items-center text-center gap-3 relative">
        {/* Settings button for own profile */}
        {isOwn && (
          <Link
            href="/settings"
            className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
        )}
        
        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {profile.name?.[0] ?? '?'}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold text-foreground">{profile.name}</h1>
            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex items-center gap-1">
                {badges.map((badge) => {
                  const cfg = BADGE_CONFIG[badge]
                  if (!cfg) return null
                  const Icon = cfg.icon
                  return (
                    <span key={badge} title={cfg.label} aria-label={cfg.label}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </span>
                  )
                })}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed">{profile.bio}</p>}
        </div>

        <div className="flex gap-6 text-center">
          <Link href={isOwn ? '/following?tab=followers' : '#'} className="hover:opacity-80 transition-opacity">
            <p className="text-lg font-semibold text-foreground">{followersCount}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </Link>
          <Link href={isOwn ? '/following' : '#'} className="hover:opacity-80 transition-opacity">
            <p className="text-lg font-semibold text-foreground">{profile.following_count ?? 0}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </Link>
          <div>
            <p className="text-lg font-semibold text-foreground">{photos.length}</p>
            <p className="text-xs text-muted-foreground">Photos</p>
          </div>
        </div>

        {isOwn ? (
          <Link
            href="/settings"
            className="px-6 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-accent transition-colors inline-flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Edit Profile
          </Link>
        ) : (
          <button
            onClick={toggleFollow}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              following
                ? 'bg-secondary text-secondary-foreground hover:bg-accent'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20'
            }`}
          >
            {following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {following ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Photos grid */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <Images className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No public photos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer"
              onClick={() => setViewer(photo)}
            >
              <img src={photo.url} alt={photo.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      )}

      {viewer && <PhotoViewer photo={viewer} onClose={() => setViewer(null)} />}
    </main>
  )
}
