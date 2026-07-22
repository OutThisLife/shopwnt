import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Suspense, type ReactNode } from 'react'
import { Toolbar } from '~/components'
import { ScrollTop } from '~/components/scroll-top'
import { UrlSync } from '~/components/url-sync'
import { cn } from '~/lib/utils'
import './globals.css'
import Providers from './providers'

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-app-sans',
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    default: 'shopwnt',
    template: '%s · shopwnt'
  },
  description: 'Track fresh arrivals across your favorite Shopify brands.',
  applicationName: 'shopwnt'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfcfd' },
    { media: '(prefers-color-scheme: dark)', color: '#181418' }
  ]
}

export default function RootLayout({ children }: { children?: ReactNode }) {
  return (
    <html className={sans.variable} lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-dvh bg-background font-sans text-foreground antialiased'
        )}>
        <Providers>
          <Suspense fallback={null}>
            <UrlSync />
          </Suspense>

          <Toolbar />

          <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
            {children}
          </main>

          <ScrollTop />
        </Providers>
      </body>
    </html>
  )
}
