import type { Product as IProduct } from '~/../types'
import { arrivedAt, clean, fetcher, revisedAt } from '~/lib'

const PER_PAGE = 250
const MAX_PAGES = 20
/** Pages fetched concurrently once page 1 proves there's more. */
const BATCH = 5
const TTL = 5 * 60_000

const shopify = (slug: string, path: string) =>
  new URL(path, `https://${slug}.myshopify.com`).toString()

/** Same browser-shaped headers the health probe uses; Shopify 430s bare bots. */
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  Accept: 'application/json'
}

const priceOf = (i: IProduct) => parseFloat(i?.variants?.[0]?.price) || 0

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
    const hay = metaOf(i).hay

    return tokens.every(t => hay.includes(t))
  }
}

const cmp: Record<string, (a: any, b: any) => number> = {
  price: (a, b) => metaOf(a).price - metaOf(b).price,
  arrived: (a, b) => metaOf(a).arrived - metaOf(b).arrived,
  revised: (a, b) => metaOf(a).revised - metaOf(b).revised
}

const page = async (slug: string, n: number): Promise<IProduct[]> => {
  const u = new URL(shopify(slug, 'products.json'))

  u.searchParams.set('limit', `${PER_PAGE}`)
  u.searchParams.set('page', `${n}`)

  try {
    const { products } = await fetcher<{ products?: IProduct[] }>(u.toString(), {
      headers: HEADERS
    })

    return products ?? []
  } catch {
    return []
  }
}

/**
 * products.json only supports limit/page, so the whole catalog has to be
 * walked. Page 1 goes alone — most stores fit in it, and one request is the
 * floor — then the rest go in concurrent batches instead of single file, so a
 * 20-page catalog costs ~5 round-trips rather than 20.
 */
const walk = async (slug: string): Promise<IProduct[]> => {
  const items: IProduct[] = []

  for (let at = 1; at <= MAX_PAGES; ) {
    const size = at === 1 ? 1 : Math.min(BATCH, MAX_PAGES - at + 1)
    const pages = await Promise.all(
      Array.from({ length: size }, (_, n) => page(slug, at + n))
    )
    const short = pages.findIndex(p => p.length < PER_PAGE)

    items.push(...pages.slice(0, short < 0 ? size : short + 1).flat())

    if (short >= 0) {
      break
    }

    at += size
  }

  // Vendor doubles as the store slug downstream (urls, cart links), and only
  // sellable products are worth carrying. Settled here once per walk so every
  // request shares the same object references — which is what lets metaOf
  // memoize against them.
  return items.filter(i => i?.variants?.length).map(i => ({ ...i, vendor: slug }))
}

const cache = new Map<string, { at: number; items: IProduct[] }>()
const inflight = new Map<string, Promise<IProduct[]>>()

/** One walk per store at a time — concurrent misses join it, never repeat it. */
const refresh = (slug: string): Promise<IProduct[]> => {
  const going = inflight.get(slug)

  if (going) {
    return going
  }

  const next = walk(slug)
    .then(items => {
      cache.set(slug, { at: Date.now(), items })

      return items
    })
    .finally(() => inflight.delete(slug))

  inflight.set(slug, next)

  return next
}

/**
 * Stale-while-revalidate: an expired entry still answers instantly and the
 * re-walk happens behind it, so nobody's request ever blocks on Shopify twice.
 * Only a store never seen before waits on the network.
 */
const catalog = async (slug: string): Promise<IProduct[]> => {
  const hit = cache.get(slug)

  if (!hit) {
    return refresh(slug)
  }

  if (Date.now() - hit.at >= TTL) {
    void refresh(slug)
  }

  return hit.items
}

interface FacetSelection {
  key: string
  values: string[]
}

/**
 * The filter groups worth offering grid-wide.
 *
 * Deriving groups from whatever option names the catalogs happened to use
 * surfaced junk: a store selling gift cards contributed "Denominations", one
 * with a single candle line contributed "Scent", and the menu became a column
 * per vendor quirk. These are the axes a person actually shops a mixed grid on,
 * and anything else a catalog carries is per-product detail — it belongs on the
 * card, not in a grid-wide filter.
 *
 * Option names are matched case-folded, with the aliases stores use for the
 * same axis folded onto one group.
 */
const OPTION_GROUPS: { name: string; label: string; aliases: string[] }[] = [
  { name: 'size', label: 'Size', aliases: ['size', 'sizes', 'us size', 'shoe size'] },
  { name: 'color', label: 'Color', aliases: ['color', 'colour', 'shade'] }
]

/** The option group a catalog's option name belongs to, if any. */
const groupFor = (name: string) =>
  OPTION_GROUPS.find(g => g.aliases.includes(name))

const OPTION_PREFIX = 'option:'

/** Per-group ceiling on offered values. Past this a menu stops being scannable. */
const MAX_VALUES = 40

/** Stock is the one group not read off the catalog; every store has it. */
const STOCK = { key: 'stock', label: 'Availability' }
const IN_STOCK = 'In stock'
const SOLD_OUT = 'Sold out'

/**
 * Price is a derived axis, not a catalog option. Raw prices are useless as a
 * facet — every product is its own value — so they're bucketed into bands.
 */
const PRICE = { key: 'price_band', label: 'Price' }

const PRICE_BANDS: { label: string; max: number }[] = [
  { label: 'Under $50', max: 50 },
  { label: '$50 – $100', max: 100 },
  { label: '$100 – $250', max: 250 },
  { label: '$250 – $500', max: 500 },
  { label: '$500+', max: Infinity }
]

const priceBand = (i: IProduct): string | null => {
  const p = priceOf(i)

  return p > 0 ? (PRICE_BANDS.find(b => p < b.max)?.label ?? null) : null
}

/**
 * Stores are inconsistent about casing — "Black" and "BLACK" are one color
 * listed twice. Fold on a normalized key so they count as one.
 */
const foldKey = (s: string) => s.trim().toLowerCase()

/** Every group the menu can offer, in display order. */
const FACETS: { key: string; label: string }[] = [
  { key: 'product_type', label: 'Category' },
  ...OPTION_GROUPS.map(g => ({ key: `${OPTION_PREFIX}${g.name}`, label: g.label })),
  { key: PRICE.key, label: PRICE.label },
  { key: STOCK.key, label: STOCK.label }
]

/**
 * Option values a product contributes to a canonical group, matched across
 * every alias so a store calling it "Colour" lands in the same Color column,
 * and bucketed where the group has a canonical form (sizes).
 */
const optionValues = (i: IProduct, name: string): string[] => {
  const aliases = groupFor(name)?.aliases ?? [name]

  const vals = (i?.options ?? [])
    .filter(o => aliases.includes(foldKey(`${o?.name ?? ''}`)))
    .flatMap(o => o?.values ?? [])
    .map(v => `${v ?? ''}`.trim())
    .filter(Boolean)

  return name === 'size' ? vals.map(sizeBucket) : vals
}

/** Every value a product contributes to one facet group. */
const valuesOf = (i: IProduct, key: string): string[] => {
  if (key === STOCK.key) {
    return [i?.variants?.some(v => v.available) ? IN_STOCK : SOLD_OUT]
  }

  if (key === PRICE.key) {
    const band = priceBand(i)

    return band ? [band] : []
  }

  if (key === 'product_type') {
    const t = `${i?.product_type ?? ''}`.trim()

    return t ? [t] : []
  }

  if (key.startsWith(OPTION_PREFIX)) {
    return optionValues(i, key.slice(OPTION_PREFIX.length))
  }

  return []
}

/**
 * Everything derived per product — the search haystack, the resolved sort
 * stamps, every facet group's values raw and folded — memoized against the
 * product object itself. The catalog cache hands back the same references
 * request after request, so this work happens once per walk; the facets
 * resolver alone used to redo it groups × selections times over the pool.
 */
interface Meta {
  hay: string
  price: number
  arrived: number
  revised: number
  values: Record<string, string[]>
  folded: Record<string, Set<string>>
}

const metas = new WeakMap<IProduct, Meta>()

const metaOf = (i: IProduct): Meta => {
  const hit = metas.get(i)

  if (hit) {
    return hit
  }

  const values = Object.fromEntries(FACETS.map(f => [f.key, valuesOf(i, f.key)]))

  const meta: Meta = {
    hay: haystack(i),
    price: priceOf(i),
    arrived: arrivedAt(i),
    revised: revisedAt(i),
    values,
    folded: Object.fromEntries(
      FACETS.map(f => [f.key, new Set(values[f.key].map(foldKey))])
    )
  }

  metas.set(i, meta)

  return meta
}

/**
 * Build the grid-wide filter groups from a fixed set of axes: what it is,
 * what size, what color, whether you can buy it. Values still come from the
 * live catalogs — a brand set with no shoes offers no shoe sizes — but the
 * *groups* no longer follow whatever a vendor named its options.
 *
 * Groups too sparse to be useful are dropped: a single value filters nothing.
 */
const groupsOf = (pool: IProduct[]) => {
  // Values are tallied under a case-folded key so "Black" and "BLACK" are one
  // entry; the label keeps whichever spelling the catalog used first.
  const seen = new Map<
    string,
    { label: string; values: Map<string, { label: string; count: number }> }
  >()

  const note = (key: string, label: string, value: string) => {
    const g = seen.get(key) ?? {
      label,
      values: new Map<string, { label: string; count: number }>()
    }
    const fold = foldKey(value)
    const v = g.values.get(fold) ?? { label: value, count: 0 }

    v.count += 1
    g.values.set(fold, v)
    seen.set(key, g)
  }

  for (const i of pool) {
    const meta = metaOf(i)

    for (const { key, label } of FACETS) {
      for (const v of meta.values[key] ?? []) {
        note(key, label, v)
      }
    }
  }

  const order = FACETS.map(f => f.key)

  return [...seen]
    .map(([key, g]) => ({
      key,
      label: g.label,
      // A big catalog can carry 600 colors, and every one of them is a real
      // value — but a 600-row menu is a wall, not a filter. Keep the ones that
      // cover the most products, then order those for reading.
      values: [...g.values.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, MAX_VALUES)
        .map(v => v.label)
        .sort(byValue(key))
    }))
    .filter(g => g.values.length > 1)
    .sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
}

/**
 * Letter sizes collapse into three buckets so the Size filter reads as a
 * choice (Small / Medium / Large) rather than a roll-call of every letter a
 * catalog happens to use. Numeric sizes and "One Size" belong to no bucket,
 * so they pass through as their own entries alongside the three.
 */
const SIZE_BUCKET: Record<string, string> = {
  xxs: 'Small',
  xs: 'Small',
  s: 'Small',
  m: 'Medium',
  l: 'Large',
  xl: 'Large',
  xxl: 'Large',
  xxxl: 'Large',
  '2xl': 'Large',
  '3xl': 'Large',
  '4xl': 'Large'
}

const sizeBucket = (v: string): string =>
  SIZE_BUCKET[v.trim().toLowerCase()] ?? v

/**
 * Sizes are the one group where alphabetical is actively wrong — L before M
 * before S reads as noise. Now that letter sizes collapse into Small/Medium/
 * Large buckets, sort the buckets in size order; numeric sizes and "One Size"
 * still pass through, numerically then alphabetically.
 */
const BUCKET_ORDER = ['Small', 'Medium', 'Large']

const byValue = (key: string) => (a: string, b: string) => {
  if (key === PRICE.key) {
    const idx = (v: string) => PRICE_BANDS.findIndex(band => band.label === v)

    return idx(a) - idx(b)
  }

  if (key === `${OPTION_PREFIX}size`) {
    const [ia, ib] = [BUCKET_ORDER.indexOf(a), BUCKET_ORDER.indexOf(b)]

    if (ia >= 0 && ib >= 0) {
      return ia - ib
    }

    const [na, nb] = [parseFloat(a), parseFloat(b)]

    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) {
      return na - nb
    }
  }

  return a.localeCompare(b, undefined, { numeric: true })
}

/** Within a group any selected value matches; across groups all must. */
const facetsMatch = (selections: FacetSelection[]) => (i: IProduct) =>
  selections.every(({ key, values }) => {
    if (!values?.length) {
      return true
    }

    // Folded on both sides so picking "Black" also catches the "BLACK" listings
    // it was merged with when the group was built.
    const mine =
      metaOf(i).folded[key] ?? new Set(valuesOf(i, key).map(foldKey))

    return values.some(v => mine.has(foldKey(v)))
  })

/** Every sellable product across the selected brands, narrowed by the search. */
const merge = async (handles: string[], q: string): Promise<IProduct[]> => {
  const all = (await Promise.all(handles.map(catalog))).flat()

  return q.trim() ? all.filter(matches(q)) : all
}

/** The merged pool with the search and every facet selection applied. */
const select = async (where: any): Promise<IProduct[]> => {
  const pool = await merge(where.handle_IN ?? [], where.q ?? '')
  const selections: FacetSelection[] = where.facets ?? []

  return selections.length ? pool.filter(facetsMatch(selections)) : pool
}

export const Query = {
  products: async (_: unknown, { where = {}, options = {} }: any) => {
    const ids: string[] = where.id_IN ?? []
    const handles: string[] = where.handle_IN ?? []

    if (ids.length && handles.length) {
      const res = await Promise.all(
        ids.map(id =>
          fetcher<{ product?: IProduct }>(
            shopify(handles[0], `products/${id}.json`),
            { headers: HEADERS }
          )
        )
      )

      return res.flatMap(({ product }) =>
        product ? [{ ...product, vendor: handles[0] }] : []
      )
    }

    const { limit = 24, offset = 0, sort } = options
    const [field, dir] = Object.entries(sort?.[0] ?? { arrived: 'DESC' })[0]
    const by =
      cmp[field] ?? ((a, b) => `${a?.[field]}`.localeCompare(`${b?.[field]}`))

    const found = await select(where)

    found.sort((a, b) => (dir === 'ASC' ? by(a, b) : by(b, a)))

    return found.slice(offset, offset + limit)
  },

  // Counts are computed per group with that group's own selection lifted, so a
  // value you've already picked doesn't collapse its siblings to zero and trap
  // you on one choice.
  facets: async (_: unknown, { where = {} }: any) => {
    const selections: FacetSelection[] = where.facets ?? []
    const pool = await merge(where.handle_IN ?? [], where.q ?? '')

    return groupsOf(pool).map(({ key, label, values }) => ({
      key,
      label,
      values: (() => {
        const others = selections.filter(s => s.key !== key)
        const scoped = pool.filter(facetsMatch(others))
        const counts = new Map<string, number>()

        // Tallied folded, and looked up folded: the offered label is whichever
        // spelling the catalog used first, which isn't necessarily the one any
        // given product carries.
        for (const i of scoped) {
          for (const v of metaOf(i).values[key] ?? valuesOf(i, key)) {
            const fold = foldKey(v)

            counts.set(fold, (counts.get(fold) ?? 0) + 1)
          }
        }

        return values
          .map(value => ({ value, count: counts.get(foldKey(value)) ?? 0 }))
          .filter(v => v.count > 0)
      })()
    }))
  }
}

export const Product = {
  price: (i: IProduct) => i?.variants?.[0]?.price ?? i?.price,
  url: (i: IProduct) =>
    `https://${clean(i?.vendor)}.myshopify.com/products/${i?.handle}`,
  variants: (i: IProduct) =>
    (i?.variants ?? []).map(v => ({ ...v, product: i }))
}

export const Variant = {
  cartUrl: (v: any) => {
    const host = v?.product ? clean(v.product.vendor) : v?.product_id

    return host && v?.id ? `https://${host}.myshopify.com/cart/${v.id}:1` : null
  }
}
