import Link from 'next/link'
import { Camera, Mail } from 'lucide-react'

export default function RegisterSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
            <Camera className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Mavebo</h1>
        </div>

        <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {"We've sent you a confirmation link. Please verify your email to complete registration."}
            </p>
          </div>
          <Link
            href="/auth/login"
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
