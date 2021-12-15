import { lazy } from 'react'

export * from './Button'

export const Form = lazy(() => import('./Form'))
export const Item = lazy(() => import('./Item'))
export const Skeleton = lazy(() => import('./Skeleton'))

export const WindowScroller = lazy(() => import('./WindowScroller'))

export const List = lazy(() =>
  import('react-window').then(m => ({ default: m.FixedSizeList }))
)
