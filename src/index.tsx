import 'normalize.css'
import React from 'react'
import { render } from 'react-dom'
import type { Brand, Product } from '../types'
import './index.css'

const defaultSize = /x?s|petite|00|o\/s/i

const storage = {
  get: <T extends any>(k: string): T => {
    if (storage.has(k)) {
      return JSON.parse(localStorage.getItem(k) ?? '{}') as T
    }

    return undefined as T
  },

  has: (k: string) => !!localStorage.getItem(k),
  set: <T extends any>(k: string, v: T): void =>
    localStorage.setItem(k, JSON.stringify(v))
}

const query = async <T extends any>(k: string): Promise<T> => {
  if (sessionStorage.getItem(k)) {
    return JSON.parse(sessionStorage.getItem(k) ?? '{}') as T
  }

  const v = await (await fetch(k)).json()
  sessionStorage.setItem(k, JSON.stringify(v))

  return v as T
}

const App: React.FC<Props> = ({ brands: init = [] }) => {
  const [state, setState] = React.useState<Product[]>([])
  const [brands, setBrands] = React.useState<Brand[]>(init)

  React.useEffect(() => {
    if (storage.has('brands')) {
      setBrands(storage.get<Brand[]>('brands'))
    }
  }, [])

  React.useEffect(() => {
    brands.forEach(async ({ slug, test = defaultSize }) => {
      const baseUrl = `https://${slug}.myshopify.com`
      const { products = [] } = await query<{ products: Product[] }>(
        `${baseUrl}/products.json`
      )

      const res = await Promise.all(
        products.map(async p => {
          const { product } = await query<{ product: Product }>(
            `${baseUrl}/products/${p.handle}.json`
          )

          const rxp = (() => {
            try {
              return new RegExp(String(test))
            } catch (_) {
              return new RegExp(defaultSize)
            }
          })()

          return Promise.resolve({
            ...p,
            availability: product?.variants?.find(
              v => rxp.test(v.title) && +v.inventory_quantity
            )
          })
        })
      )

      setState(st =>
        [...new Set([...st, ...res])]
          .filter(
            (p, i, r) =>
              p?.availability && r.findIndex(p2 => p2.id === p.id) === i
          )
          .sort((a, b) => +b.updated_at - +a.updated_at)
      )
    })

    storage.set(
      'brands',
      brands.map(b => ({ ...b, test: String(b) }))
    )
  }, [brands])

  const onChange = React.useCallback(
    (k: Brand) => () => setBrands(st => st.filter(v => v.slug !== k.slug)),
    []
  )

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.code === 'Enter') {
        const slug = e.currentTarget.value

        window.requestAnimationFrame(() =>
          setBrands(st => [...new Set([{ slug, test: defaultSize }, ...st])])
        )

        e.currentTarget.value = ''
      }
    },
    []
  )

  return (
    <main>
      <form method="post" action="javascript:;">
        <fieldset>
          {Array.from(brands)
            .map(b => ({
              ...b,
              valid: !!state.find(
                p => p.vendor.toLowerCase() === b.slug.toLowerCase()
              )
            }))
            .map(b => (
              <label key={b.slug}>
                <input type="checkbox" checked onChange={onChange(b)} />
                {b.valid ? b.slug : <s>{b.slug}</s>}
              </label>
            ))}

          <input
            autoComplete="off"
            id="brand"
            name="brand"
            placeholder="brand name"
            spellCheck={false}
            type="text"
            {...{ onKeyDown }}
          />
        </fieldset>
      </form>

      {state.length ? (
        state.map(p => (
          <figure key={p.id}>
            <div>
              <a
                href={`https://${p.vendor}.myshopify.com/products/${p.handle}`}
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
                  {p.availability?.inventory_quantity ?? 0} left in{' '}
                  {p.availability?.title}
                </em>
              </div>
            </div>

            <div>
              {p.images?.map((i, n) => (
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

render(
  <React.StrictMode>
    <App
      brands={
        storage.get('brands') ?? [
          { slug: 'loveshackfancy' },
          { slug: 'fillyboo' },
          { slug: 'veronicabeard' }
        ]
      }
    />
  </React.StrictMode>,
  document.getElementById('root')
)

interface Props {
  brands?: Brand[]
}
