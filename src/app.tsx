import 'normalize.css'
import React from 'react'
import type { Brand, Product } from '../types'
import './index.css'
import { clean, query, storage } from './util'

const defaultSize = /x?s|petite|00|o\/?s/i
const defaultTest = `${defaultSize}`.slice(1, -2)

const App: React.FC<Props> = ({ brands: init = [] }) => {
  const ref = React.useRef<HTMLFormElement>(null)
  const [state, setState] = React.useState<Product[]>([])
  const [brands, setBrands] = React.useState<Brand[]>(init)

  React.useEffect(() => {
    if (storage.has('brands')) {
      setBrands(storage.get<Brand[]>('brands'))
    }
  }, [])

  React.useEffect(() => {
    if (!brands.length) {
      return setState([])
    }

    brands.forEach(async ({ slug, test = defaultTest }) => {
      const baseUrl = `https://${slug}.myshopify.com`
      const { products = [] } = await query<{ products: Product[] }>(
        `${baseUrl}/products.json?limit=150`
      )

      const res = await Promise.all(
        products.map(async p => {
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
          .filter(i => brands.find(k => clean(k.slug) === clean(i.vendor)))
          .filter(
            (p, i, r) =>
              p?.availability && r.findIndex(p2 => p2.id === p.id) === i
          )
      )
    })

    storage.set('brands', brands)
  }, [brands])

  const onChange = React.useCallback(
    (k: Brand) => () => setBrands(st => st.filter(v => v.slug !== k.slug)),
    []
  )

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLFormElement>) => {
      if (ref.current instanceof HTMLFormElement && e.code === 'Enter') {
        const slug = ref.current?.brand?.value
        const test = ref.current?.size?.value ?? defaultSize

        window.requestAnimationFrame(() =>
          setBrands(st => [...new Set([{ slug, test }, ...st])])
        )

        ref.current?.reset()
      }
    },
    []
  )

  return (
    <main>
      <form method="post" action="javascript:;" {...{ ref, onKeyDown }}>
        <fieldset>
          {Array.from(brands)
            .map(b => {
              const item = state.find(i => clean(i.vendor) === clean(b.slug))

              return {
                ...b,
                valid: !!item,
                vendor: item?.vendor ?? b.slug
              }
            })
            .map(b => (
              <label key={b.slug}>
                <input type="checkbox" checked onChange={onChange(b)} />
                {b.valid ? b.vendor : <s>{b.vendor}</s>}
              </label>
            ))}

          <input
            autoComplete="off"
            id="brand"
            name="brand"
            placeholder="brand name"
            spellCheck={false}
            type="text"
          />

          <input
            autoComplete="off"
            id="size"
            name="size"
            placeholder="sizes"
            spellCheck={false}
            type="text"
            defaultValue={defaultTest}
          />
        </fieldset>
      </form>

      {state.length ? (
        Array.from(state)
          .sort(
            (a, b) =>
              +(a.availability?.inventory_quantity ?? Infinity) -
              +(b.availability?.inventory_quantity ?? Infinity)
          )
          .map(p => (
            <figure key={p.id}>
              <div>
                <a
                  href={`https://${clean(p.vendor)}.myshopify.com/products/${
                    p.handle
                  }`}
                  target="_blank"
                  rel="noopener">
                  {p.title}
                </a>

                <em>{p.vendor}</em>

                <div>
                  {parseFloat(p.variants?.[0]?.price).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </div>

                <div>
                  <em>
                    {p.availability?.title}
                    <br />
                    {p.availability?.inventory_quantity}
                  </em>
                </div>
              </div>

              <div>
                {p.images?.map(i => (
                  <img key={i.id} src={`${i.src}&width=250`} loading="lazy" />
                ))}
              </div>
            </figure>
          ))
      ) : (
        <figure>
          <div>No products found.</div>
        </figure>
      )}
    </main>
  )
}

interface Props {
  brands?: Brand[]
}

export default App
