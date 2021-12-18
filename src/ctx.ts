import type { SetStateAction } from 'react'
import { createContext } from 'react'

export const BrandContext = createContext<CTX>({
  setState: () => null,
  slugs: new Map<string, boolean>([
    ['loveshackfancy', false],
    ['veronicabeard', false],
    ['fillyboo', true],
    ['naked cashmere', false],
    ['stripe stare', false]
  ]),
  sortBy: 'updated_at',
  ts: Date.now()
})

export interface State {
  sortBy: string
  slugs: Map<string, boolean>
  ts: number
}

export interface CTX extends State {
  setState(v: SetStateAction<State>): void
}
