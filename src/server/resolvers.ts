import type { Product as IProduct } from '~/../types'
import { arrivedAt, clean, fetcher, revisedAt } from '~/lib'

const PER_PAGE = 250
const MAX_PAGES = 20
const TTL = 5 * 60_000

const shopify = (slug: string, path: string) =>
  new URL(path, `https://${slug}.myshopify.com`).toString()

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
    const hay = haystack(i)

    return tokens.every(t => hay.includes(t))
  }
}

const cmp: Record<string, (a: any, b: any) => number> = {
  price: (a, b) => priceOf(a) - priceOf(b),
  arrived: (a, b) => arrivedAt(a) - arrivedAt(b),
  revised: (a, b) => revisedAt(a) - revisedAt(b)
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
    const type = `${i?.product_type ?? ''}`.trim()

    if (type) {
      note('product_type', 'Category', type)
    }

    for (const g of OPTION_GROUPS) {
      for (const v of optionValues(i, g.name)) {
        note(`${OPTION_PREFIX}${g.name}`, g.label, v)
      }
    }

    const band = priceBand(i)

    if (band) {
      note(PRICE.key, PRICE.label, band)
    }

    note(STOCK.key, STOCK.label, i?.variants?.some(v => v.available) ? IN_STOCK : SOLD_OUT)
  }

  const groups = [...seen]
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

  const order = [
    'product_type',
    `${OPTION_PREFIX}size`,
    `${OPTION_PREFIX}color`,
    PRICE.key,
    STOCK.key
  ]

  return groups.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
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
    const mine = new Set(valuesOf(i, key).map(foldKey))

    return values.some(v => mine.has(foldKey(v)))
  })

/** Every sellable product across the selected brands, narrowed by the search. */
const merge = async (handles: string[], q: string): Promise<IProduct[]> => {
  const all = (
    await Promise.all(
      handles.map(async k =>
        (await catalog(k))
          .filter(i => i?.variants?.length)
          .map(i => ({ ...i, vendor: k }))
      )
    )
  ).flat()

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
          fetcher<{ product?: IProduct }>(shopify(handles[0], `products/${id}.json`))
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
        const scoped = pool.filter(i => facetsMatch(others)(i))
        const counts = new Map<string, number>()

        for (const i of scoped) {
          for (const v of valuesOf(i, key)) {
            counts.set(v, (counts.get(v) ?? 0) + 1)
          }
        }

        return values
          .map(value => ({ value, count: counts.get(value) ?? 0 }))
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
