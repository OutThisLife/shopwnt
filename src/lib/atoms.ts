import { atom } from 'jotai'
import type { SetStateAction } from 'react'
import { client } from '.'

const slugs = atom<Record<string, boolean>>({
  fillyboo: false,
  'for-love-lemons': false,
  'frame-denim': false,
  loveshackfancy: true,
  'naked-cashmere': false,
  selkicollection: false,
  'stripe-stare': false,
  veronicabeard: false
})

export const slugsAtom = atom(
  get => get(slugs),
  (get, set, arg: SetStateAction<Record<string, boolean>>) => {
    set(slugs, typeof arg === 'function' ? arg(get(slugs)) : arg)

    Object.entries(get(slugs))
      .filter(([, v]) => !v)
      .forEach(async ([k]) => client.removeQueries(['products', k]))
  }
)

export const sortAtom = atom('updated_at')
