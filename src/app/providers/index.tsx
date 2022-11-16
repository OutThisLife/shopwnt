import type { ReactNode } from 'react'
import RootClientRegistry from './client'
import RootStyleRegistry from './emotion'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <RootClientRegistry>
      <RootStyleRegistry>{children}</RootStyleRegistry>
    </RootClientRegistry>
  )
}
