'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Camera, ArrowRight, Heart, Menu, X, Users, BookOpen, Calendar, MessageCircle, Sparkles, Trophy, Settings, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  date: string
  author: string
  readTime: number
  icon?: React.ElementType
}

const blogPosts: BlogPost[] = [
  {
    id: 'welcome',
    title: 'Welcome to StartOrigin',
    excerpt: 'Discover the new way to share your photography journey',
    content: `
      <h2>Welcome to StartOrigin</h2>
      <p>StartOrigin is a fresh approach to photo sharing — a platform built for photographers who value authenticity, simplicity, and real connections. No algorithms, no noise, just pure photography.</p>
      
      <h3>What makes StartOrigin different?</h3>
      <ul>
        <li><strong>Chronological feed</strong> — See posts in the order they were shared, not what an algorithm thinks you want to see</li>
        <li><strong>Collections & Albums</strong> — Organize your photos your way, create collections and albums that make sense to you</li>
        <li><strong>Privacy controls</strong> — Choose who sees your photos: public, private, or just your followers</li>
        <li><strong>No ads, no tracking</strong> — Your data stays yours. We don't sell your information</li>
      </ul>
      
      <p>Whether you're a professional photographer or just someone who loves capturing moments, StartOrigin gives you a home for your visual stories.</p>
      
      <p><strong>Get started today</strong> — create your account, upload your first photo, and join a growing community of photographers who believe in keeping photography authentic.</p>
    `,
    image: 'https://images.unsplash.com/photo-1724727012426-bb8f5b958a6d?w=800&auto=format&fit=crop&q=80',
    date: 'April 1, 2026',
    author: 'StartOrigin Team',
    readTime: 3,
    icon: Sparkles
  },
  {
    id: 'tinder-mode-update',
    title: '🔥 New Feature: Tinder Mode, Achievements & Photo Settings',
    excerpt: 'Swipe through photos, earn achievements, and take full control of your photos',
    content: `
      <h2>Biggest Update Yet! 🎉</h2>
      <p>We're excited to announce a major update that adds new ways to discover photos and track your progress on StartOrigin!</p>
      
      <h3>✨ Tinder Mode</h3>
      <p>Looking for a fun way to discover photos? Tinder Mode lets you swipe through photos like never before! Swipe right to like, left to pass. It's addictive, fun, and a great way to find amazing photography.</p>
      <p>When you run out of photos from your feed, we automatically load beautiful photos from Unsplash so you can keep swiping!</p>
      
      <h3>🏆 Achievements System</h3>
      <p>Now you can earn achievements for your activity on StartOrigin:</p>
      <ul>
        <li><strong>Photo Explorer</strong> — Swipe 10 photos in Tinder Mode</li>
        <li><strong>Photo Hunter</strong> — Swipe 30 photos</li>
        <li><strong>Photo Master</strong> — Swipe 60 photos</li>
        <li><strong>Photo Legend</strong> — Swipe 120 photos</li>
        <li><strong>Photo Guru</strong> — Swipe 250 photos</li>
        <li><strong>Photo God</strong> — Swipe 500 photos</li>
      </ul>
      <p>And there are also achievements for uploading photos! Every milestone unlocks a special badge on your profile.</p>
      
      <h3>⚙️ Enhanced Photo Settings</h3>
      <p>You now have more control over your photos:</p>
      <ul>
        <li><strong>Rename photos</strong> — Change the name of any photo anytime</li>
        <li><strong>Move photos</strong> — Transfer photos between collections and albums</li>
        <li><strong>Change privacy</strong> — Update privacy settings even after uploading</li>
        <li><strong>Delete photos</strong> — With confirmation to prevent accidents</li>
      </ul>
      
      <h3>📱 Mobile Improvements</h3>
      <p>We've also improved the mobile experience with better navigation, smoother animations, and a cleaner interface.</p>
      
      <p><strong>Try Tinder Mode today!</strong> Look for the 🔥 button in your feed and start swiping!</p>
    `,
    image: 'https://images.unsplash.com/photo-1653130892179-98a1a5a19f32?w=800&auto=format&fit=crop&q=80',
    date: 'April 4, 2026',
    author: 'StartOrigin Team',
    readTime: 5,
    icon: Flame
  }
]

export default function BlogPage() {
  const [currentYear, setCurrentYear] = useState(2026)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  const openModal = (post: BlogPost) => {
    setSelectedPost(post)
    setModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setModalOpen(false)
    document.body.style.overflow = 'auto'
    setTimeout(() => setSelectedPost(null), 300)
  }

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 nav-glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">StartOrigin</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link href="/blog" className="text-sm text-foreground font-medium border-b-2 border-primary">
              Blog
            </Link>
            <Link
              href="/auth/choose"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 nav-glass border-b border-border">
            <div className="flex flex-col p-4 gap-3">
              <Link
                href="/about"
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/docs"
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Documentation
              </Link>
              <Link
                href="/blog"
                className="px-4 py-2 text-foreground font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/auth/choose"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-center font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Blog Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              <span>Latest Updates</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              StartOrigin Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              News, updates, and stories from the StartOrigin team
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post) => {
              const Icon = post.icon || Sparkles
              return (
                <article
                  key={post.id}
                  onClick={() => openModal(post)}
                  className="glass rounded-2xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="glass rounded-full p-2">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{post.readTime} min read</span>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    
                    <p className="text-muted-foreground text-sm mb-4">
                      {post.excerpt}
                    </p>
                    
                    <button className="text-primary text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read more
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          
          {/* Modal Content */}
          <div
            className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto glass rounded-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-accent transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Image */}
            <div className="relative h-64 rounded-xl overflow-hidden mb-6">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Meta info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{selectedPost.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{selectedPost.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{selectedPost.readTime} min read</span>
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {selectedPost.title}
            </h2>
            
            {/* Content */}
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />
            
            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-border flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">StartOrigin</span>
          </div>
          <div className="flex items-center justify-center gap-6 mb-4">
            <Link href="/about" className="text-xs text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/docs" className="text-xs text-muted-foreground hover:text-foreground">
              Docs
            </Link>
            <Link href="/blog" className="text-xs text-muted-foreground hover:text-foreground">
              Blog
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {currentYear} StartOrigin — Made with <Heart className="w-3 h-3 inline text-red-500 fill-red-500" /> for photographers
          </p>
        </div>
      </footer>
    </>
  )
}
