import 'normalize.css'
import * as React from 'react'
import Skeleton from 'react-loading-skeleton'
import useSWR, { useSWRConfig } from 'swr'
import type { Product } from '../types'
import { Form, Item } from './components'
import type { State } from './ctx'
import { BrandContext } from './ctx'
import { useStorage } from './hooks'
import { fetcher, omit, pick } from './util'

const App: React.FC = () => {
  const ctx = React.useContext(BrandContext)

  const [state, setState] = useStorage<State>('ctx', omit(ctx, 'setState'))

  const vendor = React.useMemo(
    () =>
      state?.slugs?.size
        ? `${[...state.slugs.entries()].find(([, v]) => v)?.shift()}`
        : undefined,
    [state]
  )

  const key = React.useMemo(
    () =>
      vendor ? `https://${vendor}.myshopify.com/products.json?limit=150` : null,
    [vendor]
  )

  const { mutate } = useSWRConfig()
  const { data } = useSWR<{ products: Product[] }>(key, fetcher)

  const items = Array.from([...(data?.products ?? [])])
    .map(p => ({
      ...omit(p, 'images', 'body_html', 'options', 'tags', 'originalVariants'),
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
    .sort((a, b) => {
      const k = state.sortBy

      if (k === 'price') {
        return (
          parseFloat(b.variants?.[0]?.price) -
          parseFloat(a?.variants?.[0]?.price)
        )
      }

      return a[k] < b[k] ? -1 : +(a[k] > b[k])
    })

  React.useEffect(
    () => void window.scrollTo({ behavior: 'smooth', top: 0 }),
    [state]
  )

  React.useEffect(() => {
    const onMessage = (e: MessageEvent<any>) =>
      key && e.data === 'revalidate' && mutate(key)

    navigator.serviceWorker?.addEventListener('message', onMessage)

    return () =>
      navigator.serviceWorker?.removeEventListener('message', onMessage)
  }, [key])

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
                <Item {...{ ...i, vendor: vendor ?? i?.vendor }} />
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
