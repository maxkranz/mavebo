'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Shield, Lock } from 'lucide-react'

export default function AdminGatePage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'gmax.nikolaev@gmail.com',
        password,
      })

      if (signInError) {
        setError('Incorrect password.')
        setLoading(false)
        return
      }

      // Verify it's the admin account
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Authentication failed.')
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        await supabase.auth.signOut()
        setError('Access denied.')
        setLoading(false)
        return
      }

      router.push('/admin')
    } catch {
      setError('Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-background" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your admin password to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Admin password"
              autoComplete="current-password"
              className="w-full h-12 pl-10 pr-12 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full h-12 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Enter Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  )
}
