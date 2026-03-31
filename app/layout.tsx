import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ProgressBar } from '@/components/progress-bar'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'StartOrigin',
  description: 'Your personal photo album and social platform',
  generator: 'v0.app',
  themeColor: '#f5f5fa',
  icons: {
    icon: '/startoriginreal.png',
    shortcut: '/startoriginreal.png',
    apple: '/startoriginreal.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <ProgressBar />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
