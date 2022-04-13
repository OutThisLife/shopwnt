import type { SetStateAction } from 'react'
import { createContext } from 'react'

export const BrandContext = createContext<CTX>({
  setState: () => null,
  slugs: new Map<string, boolean>([
    ['loveshackfancy', true],
    ['veronicabeard', false],
    ['fillyboo', false],
    ['naked cashmere', false],
    ['stripe stare', false],
    ['frame-denim', false],
    ['selkicollection', false],
    ['for love lemons', true]
  ]),
  sortBy: 'updated_at',
  ts: Date.now()
})

export interface State {
  sortBy: string
  slugs: Map<string, boolean>
  search?: string
  ts: number
}

export interface CTX extends State {
  setState(v: SetStateAction<State>): void
}
