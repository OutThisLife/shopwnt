import 'normalize.css'
import * as React from 'react'
import Skeleton from 'react-loading-skeleton'
import useSWR from 'swr'
import type { Product } from '../types'
import { Form, Item } from './components'
import type { State } from './ctx'
import { BrandContext } from './ctx'
import { useStorage } from './hooks'
import { fetcher, pick } from './util'

const App: React.FC = () => {
  const ctx = React.useContext(BrandContext)

  const [state, setState] = useStorage<State>(
    'ctx',
    pick(ctx, 'slugs', 'sizes')
  )

  const { data } = useSWR<{ products: Product[] }>(
    () =>
      state?.slugs?.size
        ? `https://${[...state.slugs.entries()]
            .find(([, v]) => v)
            ?.shift()}.myshopify.com/products.json?limit=150`
        : null,
    fetcher
  )

  const items = Array.from([...(data?.products ?? [])])
    .map(p => ({
      ...pick(p, 'id', 'handle', 'vendor'),
      variants: p.variants?.filter(v =>
        [...state.sizes.keys()]
          .map(s => s.toLocaleLowerCase())
          .some(s =>
            Object.values(pick(v, 'option1', 'option2', 'option3'))
              .filter(i => i)
              .map(i => i.toLocaleLowerCase())
              .includes(s)
          )
      )
    }))
    .filter(p => p.variants?.length)
    .sort((a, b) => +(a.updated_at ?? Infinity) - +(b.updated_at ?? Infinity))

  return (
    <main>
      <BrandContext.Provider value={{ ...state, setState }}>
        <React.Suspense fallback={<Skeleton height={90} />}>
          <Form />
        </React.Suspense>

        <section>
          {items.length > 0 ? (
            items.map(i => (
              <React.Suspense key={i.id} fallback={<Skeleton height={250} />}>
                <Item {...i} />
              </React.Suspense>
            ))
          ) : (
            <React.Suspense fallback={<Skeleton height={250} />}>
              <Item>
                <div>No products found</div>
              </Item>
            </React.Suspense>
          )}
        </section>
      </BrandContext.Provider>
    </main>
  )
}

export default App
