'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Plus, Images, User, Camera, Users, BookOpen } from 'lucide-react'
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
]

export default function AppNav() {
  const pathname = usePathname()
  const [addOpen, setAddOpen] = useState(false)

  const topNavItems = sidebarItems.slice(0, 4) // Feed, Search, Following, Gallery
  const bottomNavItems = sidebarItems.slice(4) // Profile
  const isDocsActive = pathname.startsWith('/docs')
  const isAboutActive = pathname === '/about'

  // Mobile nav items в порядке: Feed, Search, Gallery, Profile (Add будет между ними)
  const mobileNavItems = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/gallery', label: 'Gallery', icon: Images },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-56 z-40 nav-glass border-r border-border">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border/50">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            <Link href="/about" className="hover:text-primary transition-colors">
              StartOrigin
            </Link>
          </span>
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

          {/* Docs link */}
          <div className="mb-2">
            <Link
              href="/docs"
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                isDocsActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
              aria-current={isDocsActive ? 'page' : undefined}
            >
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              Documentation
            </Link>
          </div>

          {/* About link */}
          <div className="mb-2">
            <Link
              href="/about"
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                isAboutActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
              aria-current={isAboutActive ? 'page' : undefined}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              About
            </Link>
          </div>

          {/* Bottom navigation items (Profile) */}
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

      {/* Mobile Bottom Nav — порядок: Feed, Search, Add, Gallery, Profile */}
      <nav
        className="md:hidden fixed bottom-4 left-4 right-4 z-40 nav-glass rounded-2xl border border-border shadow-lg"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {/* Feed */}
          <div className="flex-1 flex justify-center">
            <Link
              href="/feed"
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 transition-all rounded-full',
                pathname.startsWith('/feed') ? 'text-primary' : 'text-muted-foreground',
                'hover:text-primary'
              )}
              style={{ width: 48 }}
              aria-current={pathname.startsWith('/feed') ? 'page' : undefined}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate max-w-full">Feed</span>
            </Link>
          </div>

          {/* Search */}
          <div className="flex-1 flex justify-center">
            <Link
              href="/search"
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 transition-all rounded-full',
                pathname.startsWith('/search') ? 'text-primary' : 'text-muted-foreground',
                'hover:text-primary'
              )}
              style={{ width: 48 }}
              aria-current={pathname.startsWith('/search') ? 'page' : undefined}
            >
              <Search className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate max-w-full">Search</span>
            </Link>
          </div>

          {/* Add button - без текста */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Add content"
            >
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Plus className="w-6 h-6 text-primary-foreground" />
              </div>
            </button>
          </div>

          {/* Gallery */}
          <div className="flex-1 flex justify-center">
            <Link
              href="/gallery"
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 transition-all rounded-full',
                pathname.startsWith('/gallery') ? 'text-primary' : 'text-muted-foreground',
                'hover:text-primary'
              )}
              style={{ width: 48 }}
              aria-current={pathname.startsWith('/gallery') ? 'page' : undefined}
            >
              <Images className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate max-w-full">Gallery</span>
            </Link>
          </div>

          {/* Profile */}
          <div className="flex-1 flex justify-center">
            <Link
              href="/profile"
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 transition-all rounded-full',
                pathname.startsWith('/profile') ? 'text-primary' : 'text-muted-foreground',
                'hover:text-primary'
              )}
              style={{ width: 48 }}
              aria-current={pathname.startsWith('/profile') ? 'page' : undefined}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate max-w-full">Profile</span>
            </Link>
          </div>
        </div>
      </nav>

      <AddModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}
