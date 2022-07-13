import { atomWithStorage } from 'jotai/utils'

export const slugsAtom = atomWithStorage('slugs', {
  fillyboo: false,
  'for-love-lemons': false,
  'frame-denim': false,
  loveshackfancy: true,
  'naked-cashmere': false,
  selkicollection: false,
  'stripe-stare': false,
  veronicabeard: false
})

export const sortAtom = atomWithStorage('sort', 'updated_at')
