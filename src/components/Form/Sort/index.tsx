import * as React from 'react'
import type { State } from '../../../ctx'
import { BrandContext } from '../../../ctx'
import StyledSort from './style'

export const Sort: React.FC<SortProps> = ({ for: key, options = [] }) => {
  const ctx = React.useContext(BrandContext)
  const value = ctx[key]

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault()

    const v = e.currentTarget.value
    ctx.setState(st => ({ ...st, [key]: v }))
  }

  return (
    <StyledSort {...{ onChange, value }}>
      {options.map(k => (
        <option key={k}>{k}</option>
      ))}
    </StyledSort>
  )
}

export default Sort

export interface SortProps {
  for: keyof Omit<State, 'sizes' | 'slugs'>
  options?: string[]
}
