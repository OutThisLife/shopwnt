import { lazy } from 'react'

export * from './Button'
export * from './ErrorBoundary'
export * from './Skeleton'

export const Form = lazy(() => import('./Form'))
export const Item = lazy(() => import('./Item'))
export const Search = lazy(() => import('./Search'))
export const WindowScroller = lazy(() => import('./WindowScroller'))

export const List = lazy(() =>
  import('react-window').then(m => ({ default: m.FixedSizeList }))
)
