import type { SetStateAction } from 'react'
import { createContext } from 'react'

export const BrandContext = createContext<CTX>({
  setState: () => null,
  sizes: new Map<string, boolean>([
    ['00', true],
    ['petite', true],
    ['xs', true]
  ]),
  slugs: new Map<string, boolean>([
    ['loveshackfancy', true],
    ['veronicabeard', false],
    ['fillyboo', false]
  ])
})

export interface State {
  sizes: Map<string, boolean>
  slugs: Map<string, boolean>
}

export interface CTX extends State {
  setState(v: SetStateAction<State>): void
}
