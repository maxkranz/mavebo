'use client'

import { useState } from 'react'
import type { Profile, Photo, Collection, Album, Comment, BadgeType } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import {
  Trash2, BadgeCheck, Snowflake, Monitor, Star, Images, FolderOpen, Image, MessageSquare, Users, ChevronDown, ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminData {
  photos: (Photo & { profile?: Profile; album_name?: string; collection_name?: string })[]
  collections: (Collection & { profile?: Profile })[]
  albums: (Album & { profile?: Profile; collection_name?: string })[]
  comments: (Comment & { profile?: Profile; photo_name?: string })[]
  profiles: Profile[]
}

const BADGE_OPTIONS: { value: BadgeType; icon: React.ElementType; color: string; label: string }[] = [
  { value: 'verified', icon: BadgeCheck, color: 'text-blue-500', label: 'Verified' },
  { value: 'snowflake', icon: Snowflake, color: 'text-cyan-400', label: 'Snowflake' },
  { value: 'computer', icon: Monitor, color: 'text-violet-500', label: 'Computer' },
  { value: 'star', icon: Star, color: 'text-amber-400', label: 'Star' },
]

type Tab = 'photos' | 'collections' | 'albums' | 'comments' | 'badges'

export default function AdminClient({ data }: { data: AdminData }) {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('photos')
  const [photos, setPhotos] = useState(data.photos)
  const [collections, setCollections] = useState(data.collections)
  const [albums, setAlbums] = useState(data.albums)
  const [comments, setComments] = useState(data.comments)
  const [profiles, setProfiles] = useState(data.profiles)

  async function deletePhoto(id: string) {
    if (!confirm('Delete this photo?')) return
    await supabase.from('photos').delete().eq('id', id)
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  async function deleteCollection(id: string) {
    if (!confirm('Delete this collection and all its contents?')) return
    await supabase.from('collections').delete().eq('id', id)
    setCollections((prev) => prev.filter((c) => c.id !== id))
  }

  async function deleteAlbum(id: string) {
    if (!confirm('Delete this album and all its photos?')) return
    await supabase.from('albums').delete().eq('id', id)
    setAlbums((prev) => prev.filter((a) => a.id !== id))
  }

  async function deleteComment(id: string) {
    if (!confirm('Delete this comment?')) return
    await supabase.from('comments').delete().eq('id', id)
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  async function toggleBadge(profileId: string, badge: BadgeType) {
    const profile = profiles.find((p) => p.id === profileId)
    if (!profile) return
    const current = profile.badges ?? []
    const next = current.includes(badge)
      ? current.filter((b) => b !== badge)
      : [...current, badge]
    const { error } = await supabase.from('profiles').update({ badges: next }).eq('id', profileId)
    if (!error) {
      setProfiles((prev) => prev.map((p) => p.id === profileId ? { ...p, badges: next } : p))
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'photos', label: 'Photos', icon: Image, count: photos.length },
    { id: 'collections', label: 'Collections', icon: FolderOpen, count: collections.length },
    { id: 'albums', label: 'Albums', icon: Images, count: albums.length },
    { id: 'comments', label: 'Comments', icon: MessageSquare, count: comments.length },
    { id: 'badges', label: 'Badges', icon: Users, count: profiles.length },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">Moderate content and manage user badges</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Public Photos', value: photos.length, icon: Image },
            { label: 'Collections', value: collections.length, icon: FolderOpen },
            { label: 'Comments', value: comments.length, icon: MessageSquare },
            { label: 'Users', value: profiles.length, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted mb-6 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
                tab === id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className={cn(
                'ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold',
                tab === id ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/20 text-muted-foreground',
              )}>{count}</span>
            </button>
          ))}
        </div>

        {/* Photos tab */}
        {tab === 'photos' && (
          <div className="flex flex-col gap-3">
            {photos.length === 0 && <EmptyState label="No public photos" />}
            {photos.map((photo) => (
              <div key={photo.id} className="glass rounded-xl flex gap-3 overflow-hidden">
                <div className="w-20 h-20 flex-shrink-0 bg-muted">
                  <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 py-3 pr-3 flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{photo.name}</p>
                    <p className="text-xs text-muted-foreground">by @{photo.profile?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{photo.collection_name} / {photo.album_name}</p>
                  </div>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors"
                    aria-label="Delete photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Collections tab */}
        {tab === 'collections' && (
          <div className="flex flex-col gap-3">
            {collections.length === 0 && <EmptyState label="No collections" />}
            {collections.map((col) => (
              <div key={col.id} className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{col.name}</p>
                  <p className="text-xs text-muted-foreground">by @{col.profile?.username} · {col.privacy}</p>
                </div>
                <button
                  onClick={() => deleteCollection(col.id)}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors"
                  aria-label="Delete collection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Albums tab */}
        {tab === 'albums' && (
          <div className="flex flex-col gap-3">
            {albums.length === 0 && <EmptyState label="No albums" />}
            {albums.map((album) => (
              <div key={album.id} className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{album.name}</p>
                  <p className="text-xs text-muted-foreground">
                    by @{album.profile?.username} · in {album.collection_name}
                  </p>
                </div>
                <button
                  onClick={() => deleteAlbum(album.id)}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors"
                  aria-label="Delete album"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Comments tab */}
        {tab === 'comments' && (
          <div className="flex flex-col gap-3">
            {comments.length === 0 && <EmptyState label="No comments" />}
            {comments.map((comment) => (
              <div key={comment.id} className="glass rounded-xl px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">"{comment.content}"</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    by @{comment.profile?.username}
                    {comment.photo_name && ` · on "${comment.photo_name}"`}
                  </p>
                </div>
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors mt-0.5"
                  aria-label="Delete comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Badges tab */}
        {tab === 'badges' && (
          <div className="flex flex-col gap-3">
            {profiles.length === 0 && <EmptyState label="No users" />}
            {profiles.map((profile) => (
              <div key={profile.id} className="glass rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {profile.name?.[0] ?? '?'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">@{profile.username}</p>
                  </div>
                </div>

                {/* Badge toggles */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {BADGE_OPTIONS.map(({ value, icon: Icon, color, label }) => {
                    const active = (profile.badges ?? []).includes(value)
                    return (
                      <button
                        key={value}
                        onClick={() => toggleBadge(profile.id, value)}
                        title={active ? `Remove ${label}` : `Give ${label}`}
                        aria-label={active ? `Remove ${label} from ${profile.name}` : `Give ${label} to ${profile.name}`}
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center transition-all border',
                          active
                            ? 'bg-card border-border shadow-sm'
                            : 'bg-muted border-transparent opacity-40 hover:opacity-70',
                        )}
                      >
                        <Icon className={`w-4 h-4 ${active ? color : 'text-muted-foreground'}`} />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
