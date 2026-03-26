'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, User, Camera, Image, Users, ArrowRight, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const pathname = usePathname()
  const [currentYear, setCurrentYear] = useState(2026)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-56 z-40 nav-glass border-r border-border">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border/50">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              StartOrigin
            </Link>
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4" aria-label="Main navigation">
          {/* Main navigation items */}
          <div className="flex-1">
            <Link
              href="/about"
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                pathname === '/about'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              About
            </Link>
            
            <Link
              href="/docs"
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                pathname === '/docs'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              <Image className="w-5 h-5 flex-shrink-0" />
              Documentation
            </Link>
          </div>

          {/* Centered Add button as link */}
          <div className="flex justify-center my-2">
            <Link
              href="/add"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all w-full"
            >
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Plus className="w-3 h-3 text-primary-foreground" />
              </div>
              <span>Add</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:pl-56">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Camera className="w-4 h-4" />
              <span>StartOrigin v1.0</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
              Hey, it's{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                StartOrigin
              </span>
              .
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Here, we are discovering new possibilities of photographing.
              <br />
              <span className="text-base">Share your vision, inspire others.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/choose"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all transform hover:scale-105"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href="/feed"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all"
              >
                Explore Feed
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything you need to share your vision
              </h2>
              <p className="text-muted-foreground text-lg">
                Simple, elegant, and focused on what matters — your photographs.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="glass rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Publish photos
                </h3>
                <p className="text-muted-foreground">
                  Share your moments with the world. Upload photos with meaningful titles, no algorithms, just pure photography.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="glass rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Storage photos in Gallery
                </h3>
                <p className="text-muted-foreground">
                  Organize your photos in collections and albums. Keep your memories organized and easily accessible.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="glass rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Follow people you like
                </h3>
                <p className="text-muted-foreground">
                  Discover amazing photographers and build your personal feed. Stay inspired by the creators you love.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to start your journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join StartOrigin today and become part of a community that celebrates authentic photography.
            </p>
            <Link
              href="/auth/choose"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all transform hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">StartOrigin</span>
                <span className="text-muted-foreground text-sm ml-2">
                  © {currentYear} StartOrigin
                </span>
              </div>
              
              <div className="flex items-center gap-6">
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </div>
            </div>
            
            <div className="text-center mt-8 pt-8 border-t border-border/50">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for photography lovers
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Mobile Bottom Nav - 3 items */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 nav-glass border-t border-border"
        aria-label="Main navigation"
      >
        <div className="grid grid-cols-3 items-center px-4 py-2 pb-safe">
          {/* Feed */}
          <MobileNavItem href="/feed" label="Feed" icon={Home} active={pathname === '/feed'} />
          
          {/* Center Add button as link */}
          <div className="flex justify-center">
            <Link
              href="/add"
              className="flex flex-col items-center gap-0 px-2 py-1"
              aria-label="Add content"
            >
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 -mt-3">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-[10px] font-medium mt-1 text-primary">Add</span>
            </Link>
          </div>
          
          {/* Profile */}
          <MobileNavItem href="/profile" label="Profile" icon={User} active={pathname === '/profile'} />
        </div>
      </nav>
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
