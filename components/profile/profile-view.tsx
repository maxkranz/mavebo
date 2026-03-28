'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Photo, BadgeType } from '@/lib/types'
import { UserPlus, UserCheck, Images, BadgeCheck, Snowflake, Monitor, Star, Settings, Trophy, Flame, Camera, Sparkles, X, Search, Upload, Eye, EyeOff } from 'lucide-react'
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

// Ачивки за свайпы
const SWIPE_ACHIEVEMENTS = [
  { count: 10, title: "Photo Explorer", icon: Camera, color: "text-green-500", description: "Swiped 10 photos" },
  { count: 30, title: "Photo Hunter", icon: Search, color: "text-blue-500", description: "Swiped 30 photos" },
  { count: 60, title: "Photo Master", icon: Star, color: "text-purple-500", description: "Swiped 60 photos" },
  { count: 120, title: "Photo Legend", icon: Flame, color: "text-orange-500", description: "Swiped 120 photos" },
  { count: 250, title: "Photo Guru", icon: Sparkles, color: "text-yellow-500", description: "Swiped 250 photos" },
  { count: 500, title: "Photo God", icon: Trophy, color: "text-cyan-500", description: "Swiped 500 photos" },
]

// Ачивки за загруженные фотки
const UPLOAD_ACHIEVEMENTS = [
  { count: 1, title: "First Step", icon: Upload, color: "text-gray-500", description: "Uploaded first photo" },
  { count: 5, title: "Getting Started", icon: Camera, color: "text-green-500", description: "Uploaded 5 photos" },
  { count: 10, title: "Photo Enthusiast", icon: Camera, color: "text-green-500", description: "Uploaded 10 photos" },
  { count: 15, title: "Shutterbug", icon: Camera, color: "text-emerald-500", description: "Uploaded 15 photos" },
  { count: 20, title: "Getting Serious", icon: Flame, color: "text-orange-500", description: "Uploaded 20 photos" },
  { count: 25, title: "Dedicated", icon: Flame, color: "text-orange-500", description: "Uploaded 25 photos" },
  { count: 30, title: "Photography Addict", icon: Star, color: "text-purple-500", description: "Uploaded 30 photos" },
  { count: 35, title: "Photo Lover", icon: Star, color: "text-purple-500", description: "Uploaded 35 photos" },
  { count: 40, title: "Creative Eye", icon: Star, color: "text-purple-500", description: "Uploaded 40 photos" },
  { count: 45, title: "Visual Artist", icon: Star, color: "text-indigo-500", description: "Uploaded 45 photos" },
  { count: 50, title: "Photography Pro", icon: Trophy, color: "text-yellow-500", description: "Uploaded 50 photos" },
  { count: 55, title: "Expert", icon: Trophy, color: "text-yellow-500", description: "Uploaded 55 photos" },
  { count: 60, title: "Master Photographer", icon: Trophy, color: "text-yellow-500", description: "Uploaded 60 photos" },
  { count: 65, title: "Visionary", icon: Trophy, color: "text-amber-500", description: "Uploaded 65 photos" },
  { count: 70, title: "Photo Virtuoso", icon: Trophy, color: "text-amber-500", description: "Uploaded 70 photos" },
  { count: 75, title: "Artistic Soul", icon: Sparkles, color: "text-pink-500", description: "Uploaded 75 photos" },
  { count: 80, title: "Photo Legend", icon: Sparkles, color: "text-pink-500", description: "Uploaded 80 photos" },
  { count: 85, title: "Iconic", icon: Sparkles, color: "text-rose-500", description: "Uploaded 85 photos" },
  { count: 90, title: "Masterpiece Creator", icon: Sparkles, color: "text-rose-500", description: "Uploaded 90 photos" },
  { count: 95, title: "Photography Guru", icon: Trophy, color: "text-purple-500", description: "Uploaded 95 photos" },
  { count: 100, title: "Photo God", icon: Trophy, color: "text-cyan-500", description: "Uploaded 100 photos" },
]

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
  const [hiddenAchievements, setHiddenAchievements] = useState<Set<string>>(new Set())
  const [showHiddenAchievements, setShowHiddenAchievements] = useState(false)

  // Загружаем данные пользователя
  useEffect(() => {
    loadUserStats()
    loadAchievements()
    loadHiddenAchievements()
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

  async function loadHiddenAchievements() {
    if (!isOwn) return
    
    const { data } = await supabase
      .from('user_settings')
      .select('hidden_achievements')
      .eq('user_id', profile.id)
      .single()
    
    if (data?.hidden_achievements) {
      setHiddenAchievements(new Set(data.hidden_achievements))
    }
  }

  async function toggleHideAchievement(achievementId: string) {
    const newHiddenSet = new Set(hiddenAchievements)
    
    if (newHiddenSet.has(achievementId)) {
      newHiddenSet.delete(achievementId)
    } else {
      newHiddenSet.add(achievementId)
    }
    
    setHiddenAchievements(newHiddenSet)
    
    // Сохраняем в базу
    await supabase
      .from('user_settings')
      .upsert({
        user_id: profile.id,
        hidden_achievements: Array.from(newHiddenSet)
      })
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
  
  // Фильтруем ачивки для отображения
  const visibleAchievements = achievements.filter(ach => !hiddenAchievements.has(ach.id))
  const hiddenAchievementsList = achievements.filter(ach => hiddenAchievements.has(ach.id))

  // Функция для получения конфига ачивки
  const getAchievementConfig = (achievementName: string) => {
    // Проверяем среди ачивок за свайпы
    const swipeAch = SWIPE_ACHIEVEMENTS.find(a => a.title === achievementName)
    if (swipeAch) {
      return { icon: swipeAch.icon, color: swipeAch.color, label: swipeAch.description }
    }
    // Проверяем среди ачивок за загрузки
    const uploadAch = UPLOAD_ACHIEVEMENTS.find(a => a.title === achievementName)
    if (uploadAch) {
      return { icon: uploadAch.icon, color: uploadAch.color, label: uploadAch.description }
    }
    return null
  }

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

      {/* Visible Achievements Section */}
      {visibleAchievements.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Achievements
          </h2>
          <div className="flex flex-wrap gap-2">
            {visibleAchievements.map((achievement) => {
              const achConfig = getAchievementConfig(achievement.achievement_name)
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
                    <button
                      onClick={() => toggleHideAchievement(achievement.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 hover:bg-destructive hover:text-destructive-foreground"
                      aria-label="Hide achievement"
                      title="Hide from profile"
                    >
                      <EyeOff className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Hidden Achievements Section (only visible to owner) */}
      {isOwn && hiddenAchievementsList.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-5 opacity-75 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowHiddenAchievements(!showHiddenAchievements)}
            className="w-full flex items-center justify-between text-sm font-semibold text-foreground mb-3"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span>Hidden Achievements ({hiddenAchievementsList.length})</span>
            </div>
            <span className="text-xs text-muted-foreground">{showHiddenAchievements ? '▼' : '▶'}</span>
          </button>
          
          {showHiddenAchievements && (
            <div className="flex flex-wrap gap-2 mt-2">
              {hiddenAchievementsList.map((achievement) => {
                const achConfig = getAchievementConfig(achievement.achievement_name)
                if (!achConfig) return null
                const Icon = achConfig.icon
                return (
                  <div key={achievement.id} className="relative group">
                    <div 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-dashed border-border opacity-70"
                      title={achConfig.label}
                    >
                      <Icon className={`w-4 h-4 ${achConfig.color} opacity-70`} />
                      <span className="text-xs font-medium text-muted-foreground">{achievement.achievement_name}</span>
                    </div>
                    <button
                      onClick={() => toggleHideAchievement(achievement.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                      aria-label="Show achievement"
                      title="Show on profile"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
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
