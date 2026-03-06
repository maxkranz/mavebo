import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppNav from '@/components/app-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen">
      <AppNav />
      {/* Desktop: offset for sidebar */}
      <div className="md:ml-56">
        {/* Mobile: offset for bottom nav */}
        <div className="pb-20 md:pb-0 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  )
}
