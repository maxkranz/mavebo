'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, User, Camera, Image, Users, Heart, Award, Sparkles, Shield, Globe, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AboutPage() {
  const pathname = usePathname()

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
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              <span>Our Story</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              We believe in the
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                power of photography
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              StartOrigin was born from a simple idea — create a space where photographers can share their work without algorithms, noise, or distractions.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  To empower photographers of all levels to share their vision freely, connect with like-minded creators, and build meaningful galleries without the pressure of engagement metrics.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Simple, chronological feed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-foreground">No algorithmic manipulation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Global community of photographers</span>
                  </div>
                </div>
              </div>
              <div className="glass rounded-2xl p-8 text-center">
                <Camera className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">
                  "Photography is the story I fail to put into words."
                </p>
                <p className="text-sm text-muted-foreground">— Destin Sparks</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                What we stand for
              </h2>
              <p className="text-muted-foreground text-lg">
                Our values shape everything we do
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass rounded-2xl p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Authenticity
                </h3>
                <p className="text-muted-foreground">
                  We celebrate real moments, real photographers, and real connections without filters or fakery.
                </p>
              </div>
              
              <div className="glass rounded-2xl p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Simplicity
                </h3>
                <p className="text-muted-foreground">
                  Clean interface, straightforward features. No complexity, just pure photography sharing.
                </p>
              </div>
              
              <div className="glass rounded-2xl p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Community
                </h3>
                <p className="text-muted-foreground">
                  A supportive space where photographers inspire each other and grow together.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Built with passion
              </h2>
              <p className="text-muted-foreground text-lg">
                By photographers, for photographers
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="glass rounded-2xl p-8 max-w-md text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  StartOrigin Team
                </h3>
                <p className="text-muted-foreground mb-4">
                  A small team of developers and photographers who believe in creating a better space for visual storytelling.
                </p>
                <Link
                  href="/auth/choose"
                  className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all"
                >
                  Join our community
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to share your vision?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of photographers who found their creative home at StartOrigin.
            </p>
            <Link
              href="/auth/choose"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all transform hover:scale-105"
            >
              Get Started
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
                  © {new Date().getFullYear()} StartOrigin
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
          <MobileNavItem href="/feed" label="Feed" icon={Home} active={pathname === '/feed'} />
          
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
