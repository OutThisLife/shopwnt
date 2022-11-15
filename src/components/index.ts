'use client'

import { lazy } from 'react'

export { FixedSizeList as List } from 'react-window'

export const Form = lazy(() => import('./Form'))
export const Item = lazy(() => import('./Item'))
export const WindowScroller = lazy(() => import('./WindowScroller'))
