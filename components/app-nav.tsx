'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Plus, Images, User, Camera, Users, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
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
  const [activeIndex, setActiveIndex] = useState(0)
  const [bubbleStyle, setBubbleStyle] = useState({ left: 0, width: 0 })
  const navRefs = useRef<(HTMLDivElement | null)[]>([])

  const topNavItems = sidebarItems.slice(0, 4) // Feed, Search, Following, Gallery
  const bottomNavItems = sidebarItems.slice(4) // Profile
  const isDocsActive = pathname.startsWith('/docs')
  const isAboutActive = pathname === '/about'

  // Mobile nav items (5 items, Add is separate and centered)
  const mobileNavItems = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/gallery', label: 'Gallery', icon: Images },
    { href: '/following', label: 'Following', icon: Users },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  // Find active index for mobile nav
  useEffect(() => {
    const activeItemIndex = mobileNavItems.findIndex(item => pathname.startsWith(item.href))
    if (activeItemIndex !== -1 && activeItemIndex !== activeIndex) {
      setActiveIndex(activeItemIndex)
    }
  }, [pathname, mobileNavItems, activeIndex])

  // Update bubble position
  useEffect(() => {
    const activeElement = navRefs.current[activeIndex]
    if (activeElement) {
      const rect = activeElement.getBoundingClientRect()
      const containerRect = activeElement.parentElement?.parentElement?.getBoundingClientRect()
      if (containerRect) {
        setBubbleStyle({
          left: rect.left - containerRect.left,
          width: rect.width,
        })
      }
    }
  }, [activeIndex])

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
          {/* Top navigation items with bubble effect */}
          <div className="flex-1 relative">
            {topNavItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative z-10 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  pathname.startsWith(href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            ))}
            {/* Bubble indicator for desktop */}
            {(() => {
              const activeDesktopIndex = topNavItems.findIndex(item => pathname.startsWith(item.href))
              if (activeDesktopIndex !== -1) {
                return (
                  <div className="absolute left-0 right-0 transition-all duration-300 ease-out pointer-events-none">
                    <div 
                      className="bg-primary/10 rounded-xl backdrop-blur-sm border border-primary/20"
                      style={{
                        position: 'absolute',
                        top: activeDesktopIndex * 44 + 4,
                        left: 0,
                        right: 0,
                        height: 44,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }} 
                    />
                  </div>
                )
              }
              return null
            })()}
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

          {/* Docs link with bubble */}
          <div className="mb-2 relative">
            <Link
              href="/docs"
              className={cn(
                'relative z-10 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                isDocsActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
              aria-current={isDocsActive ? 'page' : undefined}
            >
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              Documentation
            </Link>
            {isDocsActive && (
              <div className="absolute inset-0 bg-primary/10 rounded-xl backdrop-blur-sm border border-primary/20 pointer-events-none" />
            )}
          </div>

          {/* About link with bubble */}
          <div className="mb-2 relative">
            <Link
              href="/about"
              className={cn(
                'relative z-10 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                isAboutActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
              aria-current={isAboutActive ? 'page' : undefined}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              About
            </Link>
            {isAboutActive && (
              <div className="absolute inset-0 bg-primary/10 rounded-xl backdrop-blur-sm border border-primary/20 pointer-events-none" />
            )}
          </div>

          {/* Bottom navigation items (Profile) */}
          <div className="mt-auto pt-2 border-t border-border/50 relative">
            {bottomNavItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative z-10 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  pathname.startsWith(href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            ))}
            {pathname.startsWith('/profile') && (
              <div className="absolute inset-x-0 bg-primary/10 rounded-xl backdrop-blur-sm border border-primary/20 pointer-events-none" style={{
                top: 4,
                height: 44
              }} />
            )}
          </div>
        </nav>
      </aside>

      {/* Mobile Bottom Nav — with Add button centered and no text */}
      <nav
        className="md:hidden fixed bottom-4 left-4 right-4 z-40 nav-glass rounded-2xl border border-border shadow-lg"
        aria-label="Main navigation"
      >
        <div className="relative flex items-center justify-around px-2 py-2">
          {/* Animated bubble */}
          <div
            className="absolute bg-primary/20 rounded-full backdrop-blur-sm border border-primary/30 transition-all duration-300 ease-out pointer-events-none"
            style={{
              left: bubbleStyle.left,
              width: bubbleStyle.width,
              height: 48,
              top: 4,
            }}
          />
          
          {/* Left side items (2 items before Add) */}
          {mobileNavItems.slice(0, 2).map((item, index) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            
            return (
              <div
                key={item.href}
                ref={el => { navRefs.current[index] = el }}
                className="flex-1 flex justify-center"
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-2 transition-all rounded-full',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                    'hover:text-primary'
                  )}
                  style={{ width: 48 }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium truncate max-w-full">{item.label}</span>
                </Link>
              </div>
            )
          })}
          
          {/* Add button in center - without text */}
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
          
          {/* Right side items (3 items after Add) */}
          {mobileNavItems.slice(2, 5).map((item, index) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            const adjustedIndex = index + 2 // Adjust index for refs
            
            return (
              <div
                key={item.href}
                ref={el => { navRefs.current[adjustedIndex] = el }}
                className="flex-1 flex justify-center"
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-2 transition-all rounded-full',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                    'hover:text-primary'
                  )}
                  style={{ width: 48 }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium truncate max-w-full">{item.label}</span>
                </Link>
              </div>
            )
          })}
        </div>
      </nav>

      <AddModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}
