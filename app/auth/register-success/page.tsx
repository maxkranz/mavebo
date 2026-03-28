import Link from 'next/link'
import { Camera, Mail, AlertCircle } from 'lucide-react'

export default function RegisterSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
            <Camera className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">StartOrigin</h1>
        </div>

        <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              We've sent you a confirmation link from{' '}
              <span className="font-medium text-primary bg-primary/5 px-1.5 py-0.5 rounded-md">
                team@startorigin.me
              </span>
              . Please verify your email to complete registration.
            </p>
          </div>

          {/* Spam warning */}
          <div className="mt-2 w-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-400">
              <span className="font-semibold">Check the spam folder!</span>
              <span className="text-amber-700 dark:text-amber-500">
                {" "}If you don't see the email in your inbox, please check your spam or junk folder.
              </span>
            </div>
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
