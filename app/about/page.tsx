'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Camera, Heart, Award, Sparkles, Shield, Globe, ArrowRight, Menu, X } from 'lucide-react'

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
            <Link href="/about" className="text-sm text-foreground font-medium">
              About
            </Link>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
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
                className="px-4 py-2 text-foreground font-medium"
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
      <main className="pt-16">
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
                  <Globe className="w-8 h-8 text-primary" />
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
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

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
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} StartOrigin — Made with <Heart className="w-3 h-3 inline text-red-500 fill-red-500" /> for photographers
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}
