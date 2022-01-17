import * as React from 'react'
import { areEqual } from 'react-window'
import type { Product } from '~/../types'
import { Item } from '~/components'

export const Row = React.memo<{
  index: number
  style: Record<string, any>
  data?: unknown
}>(({ index, style, data = [] }) => {
  const o = (data as any[])?.[index]

  return <Item {...{ style, ...((o?.item ?? o) as Product) }} />
}, areEqual)

export default Row
