'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Photo, BadgeType } from '@/lib/types'
import { UserPlus, UserCheck, Images, BadgeCheck, Snowflake, Monitor, Star, Settings, Trophy, Flame, Camera, Sparkles, X } from 'lucide-react'
import PhotoViewer from '@/components/photo-viewer'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

// Ачивки и их иконки
const ACHIEVEMENT_ICONS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  'Photo Explorer': { icon: Camera, color: 'text-green-500', label: 'Swiped 10 photos' },
  'Photo Hunter': { icon: Search, color: 'text-blue-500', label: 'Swiped 30 photos' },
  'Photo Master': { icon: Star, color: 'text-purple-500', label: 'Swiped 60 photos' },
  'Photo Legend': { icon: Flame, color: 'text-orange-500', label: 'Swiped 120 photos' },
  'Photo Guru': { icon: Sparkles, color: 'text-yellow-500', label: 'Swiped 250 photos' },
  'Photo God': { icon: Trophy, color: 'text-cyan-500', label: 'Swiped 500 photos' },
  'First Steps': { icon: Camera, color: 'text-green-500', label: 'Uploaded 5 photos' },
  'Getting Serious': { icon: Flame, color: 'text-orange-500', label: 'Uploaded 20 photos' },
  'Photography Addict': { icon: Star, color: 'text-purple-500', label: 'Uploaded 50 photos' },
  'Master Photographer': { icon: Trophy, color: 'text-yellow-500', label: 'Uploaded 100 photos' },
}

type Achievement = {
  id: string
  user_id: string
  achievement_type: string
  achievement_name: string
  achieved_at: string
}

export default function ProfileView({ profile, photos, isOwn, currentUserId }: Props) {
  const supabase = createClient()
  const [following, setFollowing] = useState(profile.is_following ?? false)
  const [followersCount, setFollowersCount] = useState(profile.followers_count ?? 0)
  const [viewer, setViewer] = useState<Photo | null>(null)
  const [swipeCount, setSwipeCount] = useState(0)
  const [uploadCount, setUploadCount] = useState(photos.length)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [deletingAchievement, setDeletingAchievement] = useState<string | null>(null)

  // Загружаем данные пользователя
  useEffect(() => {
    loadUserStats()
    loadAchievements()
  }, [profile.id])

  async function loadUserStats() {
    // Загружаем счетчик свайпов
    const { data: profileData } = await supabase
      .from('profiles')
      .select('swipe_count')
      .eq('id', profile.id)
      .single()
    
    if (profileData) {
      setSwipeCount(profileData.swipe_count || 0)
    }
    
    // Загружаем количество фото
    const { count } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
    
    setUploadCount(count || 0)
  }

  async function loadAchievements() {
    const { data } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', profile.id)
      .order('achieved_at', { ascending: false })
    
    if (data) {
      setAchievements(data)
    }
  }

  async function removeAchievement(achievementId: string) {
    setDeletingAchievement(achievementId)
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', achievementId)
        .eq('user_id', profile.id)
      
      if (!error) {
        setAchievements(prev => prev.filter(a => a.id !== achievementId))
      }
    } catch (error) {
      console.error('Error removing achievement:', error)
    } finally {
      setDeletingAchievement(null)
    }
  }

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

        {/* Stats */}
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-lg font-semibold text-foreground">{followersCount}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{profile.following_count ?? 0}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{uploadCount}</p>
            <p className="text-xs text-muted-foreground">Photos</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              {swipeCount}
            </p>
            <p className="text-xs text-muted-foreground">Swipes</p>
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

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Achievements
          </h2>
          <div className="flex flex-wrap gap-2">
            {achievements.map((achievement) => {
              const achConfig = ACHIEVEMENT_ICONS[achievement.achievement_name]
              if (!achConfig) return null
              const Icon = achConfig.icon
              return (
                <div key={achievement.id} className="relative group">
                  <div 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border hover:border-primary/50 transition-all"
                    title={achConfig.label}
                  >
                    <Icon className={`w-4 h-4 ${achConfig.color}`} />
                    <span className="text-xs font-medium text-foreground">{achievement.achievement_name}</span>
                  </div>
                  {isOwn && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                          aria-label="Remove achievement"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Achievement</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{achievement.achievement_name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => removeAchievement(achievement.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

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
