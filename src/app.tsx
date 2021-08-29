import 'normalize.css'
import * as React from 'react'
import type { Brand, Product } from '../types'
import { Form } from './Form'
import { Item } from './Item'
import { clean, query, sleep, storage } from './util'

const defaultSize = /x?s|petite|00|o\/?s/i

const App: React.FC = () => {
  const [state, setState] = React.useState<Product[]>([])

  const [{ slug = 'loveshackfancy', test = defaultSize }, setBrand] =
    React.useState<Brand>(
      () => storage.get('brand') ?? [{ slug: 'loveshackfancy' }]
    )

  React.useEffect(() => {
    ;(async () => {
      document.body.classList.toggle('loading', true)

      storage.set('brand', {
        slug,
        test: typeof test === 'string' ? test : `${test}`
      })

      const baseUrl = `https://${slug}.myshopify.com`

      const { products = [] } = await query<{ products: Product[] }>(
        `${baseUrl}/products.json?limit=150`
      )

      const res = await Promise.all(
        products.map(async p => {
          await sleep(1e3)

          const { product } = await query<{ product: Product }>(
            `${baseUrl}/products/${p.handle}.json`
          )

          return Promise.resolve({
            ...p,
            availability: product?.variants
              ?.map(v => ({
                ...v,
                inventory_quantity: v.inventory_quantity ?? Infinity
              }))
              .find(
                v =>
                  new RegExp(test, 'i').test(v.title) && +v.inventory_quantity
              )
          })
        })
      )

      setState(st =>
        [...new Set([...st, ...res])]
          .filter(i => clean(slug) === clean(i.vendor))
          .filter(
            (p, i, r) =>
              p?.availability && r.findIndex(p2 => p2.id === p.id) === i
          )
          .sort(
            (a, b) =>
              +(a.availability?.updated_at ?? Infinity) -
              +(b.availability?.updated_at ?? Infinity)
          )
      )

      window.requestAnimationFrame(() =>
        document.body.classList.toggle('loading', false)
      )
    })()
  }, [slug])

  return (
    <main>
      <Form {...{ setBrand, slug, test }} />

      <section>
        {state.length ? (
          state.map(i => <Item key={i.id} {...i} />)
        ) : (
          <Item>
            <div>No products found.</div>
          </Item>
        )}
      </section>
    </main>
  )
}

export default App
