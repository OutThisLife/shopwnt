import 'normalize.css'
import React from 'react'
import { render } from 'react-dom'
import type { Product } from '../types'
import './index.css'

const get = async <T extends any>(k: string): Promise<T> => {
  if (sessionStorage.getItem(k)) {
    return JSON.parse(sessionStorage.getItem(k) ?? '{}') as T
  }

  const v = await (await fetch(k)).json()
  sessionStorage.setItem(k, JSON.stringify(v))

  return v as T
}

const App: React.FC<Props> = ({ brands = [], sizes = /\// }) => {
  const [state, setState] = React.useState<Product[]>([])

  React.useEffect(
    () =>
      brands.forEach(async s => {
        const baseUrl = `https://${s}.myshopify.com`
        const { products = [] } = await get<{ products: Product[] }>(
          `${baseUrl}/products.json`
        )

        const res = await Promise.all(
          products.map(async p => {
            const { product } = await get<{ product: Product }>(
              `${baseUrl}/products/${p.handle}.json`
            )

            return Promise.resolve({
              ...p,
              availability: product?.variants?.find(
                v => sizes.test(v.title) && v.inventory_quantity
              )
            })
          })
        )

        setState(st => [...new Set([...st, ...res])])
      }),
    []
  )

  return (
    <main>
      {Array.from(state).map(p => (
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
      brands={['loveshackfancy', 'fillyboo']}
      sizes={/x?s|petite|00|o\/s/i}
    />
  </React.StrictMode>,
  document.getElementById('root')
)

interface Props {
  brands: string[]
  sizes: RegExp
}
