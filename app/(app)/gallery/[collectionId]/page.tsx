import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Lock, Users, Globe, Images } from 'lucide-react'
import CollectionClient from '@/components/gallery/collection-client'
import type { Collection, Album } from '@/lib/types'

const privacyIcon = { private: Lock, followers: Users, public: Globe }

interface Props {
  params: Promise<{ collectionId: string }>
}

export default async function CollectionPage({ params }: Props) {
  const { collectionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('id', collectionId)
    .single()

  if (!collection) notFound()
  if (collection.user_id !== user!.id) redirect('/gallery')

  const { data: albums } = await supabase
    .from('albums')
    .select('*, photos(*)')
    .eq('collection_id', collectionId)
    .order('sort_order')

  const Icon = privacyIcon[collection.privacy as keyof typeof privacyIcon] ?? Lock

  return (
    <main className="px-4 pt-6 pb-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/gallery" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-foreground tracking-tight truncate">{collection.name}</h1>
        </div>
        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>

      <CollectionClient
        collection={collection as Collection}
        initialAlbums={(albums ?? []) as Album[]}
      />
    </main>
  )
}
