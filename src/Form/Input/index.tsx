/* eslint-disable no-alert */
import * as React from 'react'
import type { State } from '../../ctx'
import { BrandContext } from '../../ctx'
import { Tag } from '../Tag'
import StyledInput from './style'

export const Input: React.FC<InputProps> = ({ for: key }) => {
  const ctx = React.useContext(BrandContext)
  const singleton = React.useRef(key === 'slugs').current

  const handle = (k: string, v: boolean) =>
    ctx.setState(s => {
      if (singleton) {
        Array.from([...s[key].keys()]).forEach(k0 => s[key].set(k0, false))
      }

      return { ...s, [key]: s[key].set(k, v) }
    })

  const add = () => {
    const str = window.prompt(`Add New ${singleton ? 'Brand' : 'Size'}`, '')

    if (str) {
      handle(str, true)
    }
  }

  const toggle = (t: string) => (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()

    handle(t, true)
  }

  const remove = (t: string) => (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (window.confirm(`Are you sure you want to remove ${t}?`)) {
      ctx.setState(s => {
        s[key].delete(t)

        if (s[key].size) {
          s[key].set(`${[...s[key].keys()].shift()}`, true)
        }

        return { ...s, [key]: s[key] }
      })
    }
  }

  const label = React.useMemo(() => (key ? `${key}: ` : ''), [])

  return (
    <StyledInput htmlFor={key}>
      <span>{label}</span>

      <div>
        {[...ctx[key].entries()].map(([t]) => (
          <Tag
            key={t}
            $active={singleton && !!ctx[key].get(t)}
            label={t}
            onClick={toggle(t)}
            onDelete={remove(t)}
          />
        ))}
      </div>

      <Tag $invert label="+" onClick={add} />
    </StyledInput>
  )
}

interface InputProps {
  for: keyof State
}

export default Input
