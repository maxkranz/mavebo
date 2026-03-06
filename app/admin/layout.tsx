import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/gate')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/admin/gate')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 nav-glass border-b border-border px-4 py-3 flex items-center gap-3">
        <Link
          href="/feed"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to app
        </Link>
        <span className="text-sm font-semibold text-foreground">Admin Panel</span>
      </header>
      {children}
    </div>
  )
}
