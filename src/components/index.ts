import { lazy } from 'react'

export * from './Form'

export const Item = lazy(() => import('./Item'))
