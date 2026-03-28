'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, BadgeCheck, Snowflake } from 'lucide-react'
import type { Profile, Photo } from '@/lib/types'
import Link from 'next/link'
import PhotoViewer from '@/components/photo-viewer'

const OFFICIAL_USERS = [
  { username: 'startorigin', name: 'StartOrigin', icon: BadgeCheck, color: 'text-blue-500', badge: 'verified' },
  { username: 'winter', name: 'Winter', icon: Snowflake, color: 'text-cyan-400', badge: 'snowflake' },
]

export default function SearchPage() {
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<Profile[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'people' | 'photos'>('people')
  const [viewer, setViewer] = useState<Photo | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null))
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setUsers([])
      setPhotos([])
      return
    }
    const timeout = setTimeout(() => doSearch(query.trim()), 300)
    return () => clearTimeout(timeout)
  }, [query])

  async function doSearch(q: string) {
    setLoading(true)
    const [{ data: userResults }, { data: photoResults }] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .or(`name.ilike.%${q}%,username.ilike.%${q}%`)
        .limit(20),
      supabase
        .from('photos')
        .select('*, profile:profiles(name, username, avatar_url), likes(count), comments(count)')
        .eq('privacy', 'public')
        .or(`name.ilike.%${q}%`)
        .limit(30),
    ])
    setUsers((userResults as Profile[]) ?? [])
    setPhotos(
      ((photoResults ?? []) as any[]).map((p) => ({
        ...p,
        likes_count: p.likes?.[0]?.count ?? 0,
        comments_count: p.comments?.[0]?.count ?? 0,
      })),
    )
    setLoading(false)
  }

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'verified':
        return <BadgeCheck className="h-4 w-4 text-blue-500" />
      case 'snowflake':
        return <Snowflake className="h-4 w-4 text-cyan-400" />
      default:
        return null
    }
  }

  return (
    <main className="px-4 pt-6 pb-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Search</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people or photos..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Official Users Section - показываем когда нет поиска */}
      {!query && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Official</h2>
          <div className="flex flex-col gap-2">
            {OFFICIAL_USERS.map((official) => (
              <Link
                key={official.username}
                href={`/profile/${official.username}`}
                className="glass flex items-center gap-3 px-4 py-3 rounded-2xl hover:scale-[1.01] transition-all"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{official.name[0]}</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground truncate">{official.name}</p>
                    {official.icon && <official.icon className={`h-4 w-4 ${official.color}`} />}
                  </div>
                  <p className="text-xs text-muted-foreground">@{official.username}</p>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  Official
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {query && (
        <>
          <div className="flex gap-2 mb-4">
            {(['people', 'photos'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${
                  tab === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {loading && <p className="text-sm text-muted-foreground text-center py-6">Searching...</p>}

          {!loading && tab === 'people' && (
            <div className="flex flex-col gap-2">
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No users found.</p>
              ) : (
                users.map((u) => (
                  <Link
                    key={u.id}
                    href={`/profile/${u.username}`}
                    className="glass flex items-center gap-3 px-4 py-3 rounded-2xl hover:scale-[1.01] transition-all"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                          {u.name?.[0] ?? '?'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
                        {u.badges?.map((badge) => (
                          <span key={badge}>{getBadgeIcon(badge)}</span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {!loading && tab === 'photos' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photos.length === 0 ? (
                <p className="col-span-3 text-sm text-muted-foreground text-center py-6">No photos found.</p>
              ) : (
                photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer"
                    onClick={() => setViewer(photo)}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Empty State - только когда нет поиска */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center border-t border-border">
          <Search className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Search for people or public photos</p>
        </div>
      )}

      {viewer && <PhotoViewer photo={viewer} onClose={() => setViewer(null)} />}
    </main>
  )
}
