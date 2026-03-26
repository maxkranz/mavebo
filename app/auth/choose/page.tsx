'use client'

import Link from 'next/link'
import { ArrowRight, LogIn, UserPlus } from 'lucide-react'

export default function AuthChoosePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20 bg-background">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span>Welcome to StartOrigin</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
            Choose your path
          </h1>
          
          <p className="text-muted-foreground">
            Join our community of photographers or continue your journey
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* I already have an account */}
          <Link
            href="/auth/login"
            className="glass rounded-2xl p-6 flex items-center justify-between group hover:bg-primary/5 transition-all transform hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  I already have an account
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sign in to access your gallery and feed
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>

          {/* I don't have an account */}
          <Link
            href="/auth/register"
            className="glass rounded-2xl p-6 flex items-center justify-between group hover:bg-primary/5 transition-all transform hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  I don't have an account
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create a new account and start sharing your photos
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Back to home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
