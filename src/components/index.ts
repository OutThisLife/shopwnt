import { lazy } from 'react'

export const Form = lazy(() => import('./Form'))
export const Item = lazy(() => import('./Item'))
export const WindowScroller = lazy(() => import('./WindowScroller'))
export const List = lazy(() =>
  import('react-window').then(m => ({ default: m.FixedSizeList }))
)
