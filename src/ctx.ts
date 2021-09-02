import * as React from 'react'

export const BrandContext = React.createContext<CTX>({
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

interface CTX extends State {
  setState(v: React.SetStateAction<State>): void
}
