import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Lock, Globe, Images } from 'lucide-react'
import type { Collection } from '@/lib/types'

const privacyIcon = { private: Lock, public: Globe }
const privacyColor = { private: 'text-muted-foreground', public: 'text-green-500' }

export default async function GalleryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: collections } = await supabase
    .from('collections')
    .select('*, albums(count), photos(count)')
    .eq('user_id', user!.id)
    .order('sort_order')

  return (
    <main className="px-4 pt-6 pb-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Gallery</h1>
      </div>

      {!collections || collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Images className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No collections yet.</p>
          <p className="text-muted-foreground text-xs">Tap the + button to create your first collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(collections as any[]).map((col) => {
            const Icon = privacyIcon[col.privacy as keyof typeof privacyIcon] ?? Lock
            const color = privacyColor[col.privacy as keyof typeof privacyColor] ?? 'text-muted-foreground'
            return (
              <Link
                key={col.id}
                href={`/gallery/${col.id}`}
                className="glass rounded-2xl overflow-hidden hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                {/* Cover */}
                <div className="h-36 bg-muted/50 relative">
                  {col.cover_url ? (
                    <img src={col.cover_url} alt={col.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Images className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{col.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {col.albums?.[0]?.count ?? 0} albums
                    </p>
                  </div>
                  <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
