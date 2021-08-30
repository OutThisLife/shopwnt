import 'normalize.css'
import * as React from 'react'
import type { Product } from '../types'
import type { State } from './ctx'
import { BrandContext } from './ctx'
import { Form, Input } from './Form'
import { Item } from './Item'
import { clean, query, sleep } from './util'

const App: React.FC = () => {
  const ctx = React.useContext(BrandContext)
  const [state, setState] = React.useState<State>(() => ctx)

  const [products, update] = React.useState<Map<number, Product>>(
    () => new Map()
  )

  const slug = React.useMemo<string>(
    () => `${[...state.slugs.entries()].find(([, v]) => v)?.shift()}`,
    [state]
  )

  const sizes = React.useMemo<string[]>(() => [...state.sizes.keys()], [state])

  const items = React.useMemo<Product[]>(
    () =>
      [...products.values()]
        .filter(p => p)
        .filter(p => ({
          ...p,
          availability: p?.variants
            ?.map(v => ({
              ...v,
              inventory_quantity: v.inventory_quantity ?? Infinity
            }))
            .find(v =>
              sizes.length
                ? new RegExp(
                    `(o/s|${sizes.join('|').replace('xs', 'x?s')})`,
                    'i'
                  ).test(`${v.title}`)
                : v
            )
        }))
        .sort(
          (a, b) =>
            +(a.availability?.updated_at ?? Infinity) -
            +(b.availability?.updated_at ?? Infinity)
        ),
    [products, sizes]
  )

  React.useEffect(() => {
    ;(async () => {
      document.body.classList.toggle('loading', true)

      try {
        const baseUrl = `https://${slug}.myshopify.com`

        const catalog = await query<{ products: Product[] }>(
          `${baseUrl}/products.json?limit=${
            window.innerWidth < 1024 ? 20 : 150
          }`
        )

        // eslint-disable-next-line no-sequences
        update(st => (st.clear(), st))

        update(
          new Map(
            await Promise.all(
              (catalog.products ?? [])
                .filter(i => clean(slug) === clean(i.vendor))
                .map(async ({ handle }): Promise<[number, Product]> => {
                  await sleep(1e3)

                  const { product: p } = await query<{ product: Product }>(
                    `${baseUrl}/products/${handle}.json`
                  )

                  return [p.id, p]
                })
            )
          )
        )
      } catch (err) {
        console.error(err)
      }

      window.requestAnimationFrame(() =>
        document.body.classList.toggle('loading', false)
      )
    })()
  }, [slug])

  return (
    <main>
      <BrandContext.Provider value={{ ...state, setState }}>
        <Form>
          <fieldset>
            <Input for="slugs" />
            <Input for="sizes" />
          </fieldset>
        </Form>

        <section>
          {items.length ? (
            items.map(i => <Item key={i.id} {...i} />)
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
