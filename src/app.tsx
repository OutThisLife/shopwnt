import 'normalize.css'
import * as React from 'react'
import LazyLoad from 'react-lazyload'
import type { Product } from '../types'
import type { State } from './ctx'
import { BrandContext } from './ctx'
import { Form } from './Form'
import { Item } from './Item'
import { pick, query } from './util'

const App: React.FC = () => {
  const ctx = React.useContext(BrandContext)
  const [state, setState] = React.useState<State>(() => ctx)

  const [products, update] = React.useState<Map<number, Product>>(
    () => new Map()
  )

  const sizes = React.useMemo<string[]>(
    () => [...state.sizes.keys()].map(s => s.toLocaleLowerCase()),
    [state]
  )

  const slug = React.useMemo<string>(
    () => `${[...state.slugs.entries()].find(([, v]) => v)?.shift()}`,
    [state]
  )

  React.useEffect(() => {
    ;(async () => {
      window.scrollTo({ behavior: 'smooth', top: 0 })
      document.body.classList.toggle('loading', true)

      try {
        const res = await query<{ products: Product[] }>(slug, 'products', {
          limit: 150
        })

        update(
          new Map(
            (res.products ?? []).map(p => [
              p.id,
              {
                ...pick(p, 'id', 'handle', 'vendor'),
                variants: p.variants?.filter(v => {
                  const vs = Object.values(
                    pick(v, 'option1', 'option2', 'option3')
                  )
                    .filter(i => i)
                    .map(i => i.toLocaleLowerCase())

                  return sizes.some(s => vs.includes(s))
                })
              }
            ])
          )
        )
      } catch (err) {
        console.error(err)
      }

      window.requestAnimationFrame(() =>
        document.body.classList.toggle('loading', false)
      )
    })()
  }, [slug, sizes])

  return (
    <main>
      <BrandContext.Provider value={{ ...state, setState }}>
        <Form />

        <section>
          {products.size ? (
            [...products.values()]
              .sort(
                (a, b) =>
                  +(a.updated_at ?? Infinity) - +(b.updated_at ?? Infinity)
              )
              .map(i => (
                <LazyLoad key={i.id} height={250} offset={100}>
                  <Item {...i} />
                </LazyLoad>
              ))
          ) : (
            <Item>
              <div>
                No products found for <strong>{slug}.</strong>
              </div>
            </Item>
          )}
        </section>
      </BrandContext.Provider>
    </main>
  )
}

export default App
