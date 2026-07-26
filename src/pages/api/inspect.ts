import type { NextApiRequest, NextApiResponse } from 'next'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

export interface InspectVariant {
  id: number
  title: string
  price: number
  available: boolean
  availableCount: number | null
  inventoryQuantity: number | null
  usWarehouse: boolean | null
  hidden: boolean
  cartUrl: string
}

export interface InspectResult {
  origin: string
  handle: string
  title: string
  productUrl: string
  variants: InspectVariant[]
}

// Each lookup costs the store two requests, and they rate-limit aggressively.
const TTL = 60_000
const cache = new Map<string, { at: number; data: InspectResult }>()

const parseTarget = (raw: string) => {
  const s = raw.trim().replace(/^(https?:\/\/|\/\/)/, '')
  const m = /^([^/\s]+)\/products\/([^/?#\s]+)/.exec(s.split('?')[0])

  return m ? { origin: `https://${m[1]}`, handle: m[2] } : null
}

/**
 * Some themes wrap Shopify's own availability with their own fulfilment logic
 * (e.g. per-warehouse `available_count`) and hide variants Shopify still
 * considers buyable. Those fields only exist in the product page markup, so
 * scrape them per variant id when present.
 */
interface ThemeCounter {
  availableCount: number
  inventoryQuantity: number | null
  usWarehouse: boolean | null
}

const themeCounters = (html: string) => {
  const out = new Map<string, ThemeCounter>()

  const hits: { id: string; at: number }[] = []
  const re = /"id":(\d{10,})/g
  let m: RegExpExecArray | null

  while ((m = re.exec(html))) {
    hits.push({ id: m[1], at: m.index })
  }

  hits.forEach(({ id, at }, i) => {
    const window = html.slice(at, hits[i + 1]?.at ?? at + 2000)
    const count = /"available_count":\s*(-?\d+)/.exec(window)

    if (!count) {
      return
    }

    const inv = /"inventory_quantity":\s*(-?\d+)/.exec(window)
    const us = /"is_us_warehouse":\s*(true|false)/.exec(window)

    out.set(id, {
      availableCount: Number(count[1]),
      inventoryQuantity: inv ? Number(inv[1]) : null,
      usWarehouse: us ? us[1] === 'true' : null
    })
  })

  return out
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<InspectResult | { error: string }>
) => {
  const target = parseTarget(String(req.query?.u ?? ''))

  if (!target) {
    return res
      .status(400)
      .json({ error: 'Paste a full product URL, e.g. store.com/products/handle' })
  }

  const { origin, handle } = target
  const productUrl = `${origin}/products/${handle}`
  const hit = cache.get(productUrl)

  if (hit && Date.now() - hit.at < TTL) {
    return res.status(200).json(hit.data)
  }

  let product: {
    title?: string
    variants?: {
      id: number
      title: string
      price: number
      available: boolean
    }[]
  }

  let status = 0

  try {
    // Stock moves; never serve this from Next's fetch cache.
    const r = await fetch(`${productUrl}.js`, {
      cache: 'no-store',
      headers: { 'User-Agent': UA, Accept: 'application/json' }
    })

    status = r.status

    if (!r.ok) {
      throw new Error(`${r.status}`)
    }

    product = await r.json()
  } catch {
    return status === 429
      ? res.status(429).json({
          error: 'That store is rate-limiting us. Wait a few seconds and retry.'
        })
      : res.status(502).json({
          error:
            "Couldn't read that product — not a Shopify store, or it blocked us."
        })
  }

  if (!product?.variants?.length) {
    return res.status(404).json({ error: 'No variants found on that product.' })
  }

  // Best effort: a store without a custom stock layer still gives useful output.
  let counters = new Map<string, ThemeCounter>()

  try {
    const r = await fetch(productUrl, {
      cache: 'no-store',
      headers: { 'User-Agent': UA, Accept: 'text/html' }
    })

    if (r.ok) {
      counters = themeCounters(await r.text())
    }
  } catch {
    // Ignore — fall back to Shopify's own availability.
  }

  const variants: InspectVariant[] = product.variants.map(v => {
    const extra = counters.get(`${v.id}`)
    const availableCount = extra?.availableCount ?? null

    return {
      id: v.id,
      title: v.title,
      price: v.price,
      available: v.available,
      availableCount,
      inventoryQuantity: extra?.inventoryQuantity ?? null,
      usWarehouse: extra?.usWarehouse ?? null,
      hidden: v.available && availableCount === 0,
      cartUrl: `${origin}/cart/${v.id}:1`
    }
  })

  const data: InspectResult = {
    origin,
    handle,
    title: product.title ?? handle,
    productUrl,
    variants
  }

  cache.set(productUrl, { at: Date.now(), data })

  res.status(200).json(data)
}

export default handler
