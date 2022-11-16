'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { client } from '~/lib'

export default function RootClientRegistry({
  children
}: {
  children: ReactNode
}) {
  return <QueryClientProvider {...{ children, client }} />
}
