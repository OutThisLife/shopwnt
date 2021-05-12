import 'normalize.css'
import React from 'react'
import { render } from 'react-dom'
import type { Brand, Product } from '../types'
import './index.css'

const storage = {
  get: (k: string) => {
    if (storage.has(k)) {
      return JSON.parse(localStorage.getItem(k) ?? '{}')
    }

    return undefined
  },

  has: (k: string) => !!localStorage.getItem(k)
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
    const v = localStorage.getItem('brands')

    if (v) {
      setBrands(JSON.parse(v) as Brand[])
    }
  }, [])

  React.useEffect(() => {
    setState([])

    brands.forEach(async ({ slug, test = /x?s|petite|00|o\/s/i }) => {
      const baseUrl = `https://${slug}.myshopify.com`
      const { products = [] } = await query<{ products: Product[] }>(
        `${baseUrl}/products.json`
      )

      const res = await Promise.all(
        products.map(async p => {
          const { product } = await query<{ product: Product }>(
            `${baseUrl}/products/${p.handle}.json`
          )

          return Promise.resolve({
            ...p,
            availability: product?.variants?.find(
              v => test.test(v.title) && +v.inventory_quantity
            )
          })
        })
      )

      setState(st => [...new Set([...st, ...res])].filter(i => i?.availability))
    })

    localStorage.setItem('brands', JSON.stringify(brands))
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
          setBrands(st => [...new Set([{ slug }, ...st])])
        )

        e.currentTarget.value = ''
      }
    },
    []
  )

  return (
    <main>
      <form action="javascript:;" method="post">
        <fieldset>
          <input
            autoComplete="off"
            id="brand"
            name="brand"
            placeholder="add brand"
            spellCheck={false}
            type="text"
            {...{ onKeyDown }}
          />

          {Array.from(brands).map(b => (
            <label key={b.slug}>
              <input type="checkbox" checked onChange={onChange(b)} />
              {b.slug}
            </label>
          ))}
        </fieldset>
      </form>

      {state.map(p => (
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
      ))}
    </main>
  )
}

render(
  <React.StrictMode>
    <App
      brands={
        storage.get('brands') ?? [
          {
            slug: 'loveshackfancy'
          },
          {
            slug: 'fillyboo'
          }
        ]
      }
    />
  </React.StrictMode>,
  document.getElementById('root')
)

interface Props {
  brands?: Brand[]
}
