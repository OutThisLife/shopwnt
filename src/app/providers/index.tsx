'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useEffect, type ReactNode } from 'react'
import { Toaster } from '~/components/ui/sonner'
import { TooltipProvider } from '~/components/ui/tooltip'
import { client } from '~/lib'
import { persistQueries } from '~/lib/query-storage'

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => persistQueries(client), [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem>
      <QueryClientProvider client={client}>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        <Toaster closeButton position="bottom-right" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
