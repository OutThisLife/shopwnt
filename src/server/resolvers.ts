import type { Product as IProduct } from '~/../types'
import { clean, fetcher } from '~/lib'

const PER_PAGE = 250
const MAX_PAGES = 20
const TTL = 5 * 60_000

const shopify = (slug: string, path: string) =>
  new URL(path, `https://${slug}.myshopify.com`).toString()

const priceOf = (i: IProduct) => parseFloat(i?.variants?.[0]?.price) || 0
const timeOf = (i: any, k: string) => +new Date(i?.[k]) || 0

const norm = (s: string) =>
  `${s ?? ''}`
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')

const haystack = (i: any) =>
  norm(
    [i?.title, i?.product_type, i?.vendor, [i?.tags].flat().join(' ')]
      .filter(Boolean)
      .join(' ')
  )

const matches = (q: string) => {
  const tokens = norm(q).split(/\s+/).filter(Boolean)

  return (i: IProduct) => {
    const hay = haystack(i)

    return tokens.every(t => hay.includes(t))
  }
}

const cmp: Record<string, (a: any, b: any) => number> = {
  price: (a, b) => priceOf(a) - priceOf(b),
  created_at: (a, b) => timeOf(a, 'created_at') - timeOf(b, 'created_at'),
  updated_at: (a, b) => timeOf(a, 'updated_at') - timeOf(b, 'updated_at'),
  published_at: (a, b) => timeOf(a, 'published_at') - timeOf(b, 'published_at')
}

// products.json only supports limit/page — sorting must be done here, over the
// full catalog. Cache the walk so infinite-scroll pages don't re-fetch it all.
const cache = new Map<string, { at: number; items: IProduct[] }>()

const catalog = async (slug: string): Promise<IProduct[]> => {
  const hit = cache.get(slug)

  if (hit && Date.now() - hit.at < TTL) {
    return hit.items
  }

  const items: IProduct[] = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const u = new URL(shopify(slug, 'products.json'))

    u.searchParams.set('limit', `${PER_PAGE}`)
    u.searchParams.set('page', `${page}`)

    try {
      const { products } = await fetcher<{ products?: IProduct[] }>(u.toString())

      if (!products?.length) {
        break
      }

      items.push(...products)

      if (products.length < PER_PAGE) {
        break
      }
    } catch {
      break
    }
  }

  cache.set(slug, { at: Date.now(), items })

  return items
}

export const Query = {
  products: async (_: unknown, { where = {}, options = {} }: any) => {
    const ids: string[] = where.id_IN ?? []
    const handles: string[] = where.handle_IN ?? []

    if (ids.length && handles.length) {
      const res = await Promise.all(
        ids.map(id =>
          fetcher<{ product?: IProduct }>(shopify(handles[0], `products/${id}.json`))
        )
      )

      return res.flatMap(({ product }) =>
        product ? [{ ...product, vendor: handles[0] }] : []
      )
    }

    const { limit = 24, offset = 0, sort } = options
    const q: string = where.q ?? ''
    const [field, dir] = Object.entries(sort?.[0] ?? { created_at: 'DESC' })[0]
    const by =
      cmp[field] ?? ((a, b) => `${a?.[field]}`.localeCompare(`${b?.[field]}`))

    const merged = (
      await Promise.all(
        handles.map(async k =>
          (await catalog(k))
            .filter(i => i?.variants?.length)
            .map(i => ({ ...i, vendor: k }))
        )
      )
    ).flat()

    const found = q.trim() ? merged.filter(matches(q)) : merged

    found.sort((a, b) => (dir === 'ASC' ? by(a, b) : by(b, a)))

    return found.slice(offset, offset + limit)
  }
}

export const Product = {
  price: (i: IProduct) => i?.variants?.[0]?.price ?? i?.price,
  url: (i: IProduct) =>
    `https://${clean(i?.vendor)}.myshopify.com/products/${i?.handle}`
}
