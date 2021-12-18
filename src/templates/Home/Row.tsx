import * as React from 'react'
import { areEqual } from 'react-window'
import type { Product } from '~/../types'
import { Item } from '~/components'

export const Row = React.memo<{
  index: number
  style: Record<string, any>
  data?: unknown
}>(
  ({ index, style, data = [] }) => (
    <Item {...{ style, ...(data as Product[])?.[index] }} />
  ),
  areEqual
)

export default Row
