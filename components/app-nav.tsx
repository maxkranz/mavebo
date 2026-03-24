'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Plus, Images, User, Settings, Camera, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import AddModal from '@/components/add-modal'

// Desktop sidebar items
const sidebarItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/following', label: 'Following', icon: Users },
  { href: '/gallery', label: 'Gallery', icon: Images },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function AppNav() {
  const pathname = usePathname()
  const [addOpen, setAddOpen] = useState(false)

  // Split sidebar items into two groups for top and bottom sections
  const topNavItems = sidebarItems.slice(0, 5) // First 5 items: Feed, Search, Following, Gallery, Profile
  const bottomNavItems = sidebarItems.slice(5) // Last item: Settings

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-56 z-40 nav-glass border-r border-border">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border/50">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground"><a href="/docs">Mavebo</a></span>
        </div>

        <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4" aria-label="Main navigation">
          {/* Top navigation items */}
          <div className="flex-1">
            {topNavItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  pathname.startsWith(href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>

          {/* Centered Add button */}
          <div className="flex justify-center my-2">
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all w-full"
            >
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Plus className="w-3 h-3 text-primary-foreground" />
              </div>
              <span>Add</span>
            </button>
          </div>

          {/* Bottom navigation items (Settings) */}
          <div className="mt-auto pt-2 border-t border-border/50">
            {bottomNavItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  pathname.startsWith(href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      {/* Mobile Bottom Nav — 6 items + centered Add */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 nav-glass border-t border-border"
        aria-label="Main navigation"
      >
        <div className="grid grid-cols-7 items-center px-1 py-2 pb-safe">
          {/* Feed */}
          <div className="col-span-1">
            <MobileNavItem href="/feed" label="Feed" icon={Home} active={pathname.startsWith('/feed')} />
          </div>

          {/* Search */}
          <div className="col-span-1">
            <MobileNavItem href="/search" label="Search" icon={Search} active={pathname.startsWith('/search')} />
          </div>

          {/* Gallery */}
          <div className="col-span-1">
            <MobileNavItem href="/gallery" label="Gallery" icon={Images} active={pathname.startsWith('/gallery')} />
          </div>

          {/* Center Add button - takes 1 column */}
          <div className="col-span-1 flex justify-center">
            <button
              onClick={() => setAddOpen(true)}
              className="flex flex-col items-center gap-0 px-2 py-1"
              aria-label="Add content"
            >
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 -mt-3">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </div>
            </button>
          </div>

          {/* Following */}
          <div className="col-span-1">
            <MobileNavItem href="/following" label="Following" icon={Users} active={pathname.startsWith('/following')} />
          </div>

          {/* Profile */}
          <div className="col-span-1">
            <MobileNavItem href="/profile" label="Profile" icon={User} active={pathname.startsWith('/profile')} />
          </div>

          {/* Settings */}
          <div className="col-span-1">
            <MobileNavItem href="/settings" label="Settings" icon={Settings} active={pathname.startsWith('/settings')} />
          </div>
        </div>
      </nav>

      <AddModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}

function MobileNavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-0.5 px-2 py-1.5 transition-all',
        active ? 'text-primary' : 'text-muted-foreground',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-medium truncate max-w-full">{label}</span>
    </Link>
  )
}
