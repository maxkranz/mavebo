'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Photo, Comment } from '@/lib/types'
import { X, Heart, MessageCircle, Send } from 'lucide-react'

interface Props {
  photo: Photo
  onClose: () => void
}

export default function PhotoViewer({ photo, onClose }: Props) {
  const supabase = createClient()
  const [liked, setLiked] = useState(photo.is_liked ?? false)
  const [likesCount, setLikesCount] = useState(photo.likes_count ?? 0)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingComment, setLoadingComment] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Load likes status
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('photo_id', photo.id)
        .eq('user_id', user.id)
        .maybeSingle()
      setLiked(!!likeData)

      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('photo_id', photo.id)
      setLikesCount(count ?? 0)

      // Load comments
      const { data: commentData } = await supabase
        .from('comments')
        .select('*, profile:profiles(name, username, avatar_url)')
        .eq('photo_id', photo.id)
        .order('created_at')
      setComments((commentData as Comment[]) ?? [])
    }
    load()
  }, [photo.id])

  async function toggleLike() {
    if (!userId) return
    if (liked) {
      await supabase.from('likes').delete().eq('photo_id', photo.id).eq('user_id', userId)
      setLiked(false)
      setLikesCount((n) => Math.max(0, n - 1))
    } else {
      await supabase.from('likes').insert({ photo_id: photo.id, user_id: userId })
      setLiked(true)
      setLikesCount((n) => n + 1)
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || !userId) return
    setLoadingComment(true)
    const { data } = await supabase
      .from('comments')
      .insert({ photo_id: photo.id, user_id: userId, content: commentText.trim() })
      .select('*, profile:profiles(name, username, avatar_url)')
      .single()
    if (data) setComments((prev) => [...prev, data as Comment])
    setCommentText('')
    setLoadingComment(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-md" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col sm:flex-row glass rounded-2xl overflow-hidden z-10 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo */}
        <div className="flex-1 bg-foreground/5 min-h-64 sm:min-h-0">
          <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
        </div>

        {/* Sidebar */}
        <div className="w-full sm:w-72 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <p className="text-sm font-semibold text-foreground truncate">{photo.name}</p>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-32 max-h-64 sm:max-h-none">
            {comments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                    {c.profile?.avatar_url ? (
                      <img src={c.profile.avatar_url} alt={c.profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {c.profile?.name?.[0] ?? '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground">{c.profile?.username ?? 'user'} </span>
                    <span className="text-xs text-foreground/80">{c.content}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions + Comment input */}
          <div className="border-t border-border/50 px-4 py-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLike}
                className="flex items-center gap-1.5 text-sm transition-colors"
                aria-label={liked ? 'Unlike' : 'Like'}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                />
                <span className={`text-sm ${liked ? 'text-red-500' : 'text-muted-foreground'}`}>{likesCount}</span>
              </button>
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{comments.length}</span>
            </div>

            <form onSubmit={submitComment} className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 rounded-xl bg-input border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={loadingComment || !commentText.trim()}
                className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
