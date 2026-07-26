import type { NextApiRequest, NextApiResponse } from 'next'
import { storeHost } from '~/lib/util'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

const SHOP = /([a-z0-9][a-z0-9-]*)\.myshopify\.com/i

// A store's myshopify handle never really changes, and stores throttle hard.
const TTL = 60 * 60_000
const cache = new Map<string, { at: number; slug: string }>()

const probe = async (url: string) => {
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'User-Agent': UA, Accept: 'text/html' }
  })

  return {
    status: res.status,
    slug: res.ok
      ? (SHOP.exec(await res.text())?.[1]?.toLowerCase() ?? null)
      : null
  }
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ slug: string } | { error: string }>
) => {
  const raw = String(req.query?.u ?? '').trim()
  const host = storeHost(raw)

  if (!host.includes('.')) {
    return res
      .status(400)
      .json({ error: 'Enter a store domain or any URL from the store.' })
  }

  const hit = cache.get(host)

  if (hit && Date.now() - hit.at < TTL) {
    return res.status(200).json({ slug: hit.slug })
  }

  const cleaned = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^\/\//, '')
  const slash = cleaned.indexOf('/')
  const path = slash === -1 ? '' : cleaned.slice(slash)

  try {
    // The homepage is the lightest page carrying the shop id. A second request
    // is only worth it if that page loaded but simply didn't name the shop —
    // if we were blocked or throttled, the deeper path will be too.
    const home = await probe(`https://${host}`)

    const slug =
      home.slug ??
      (home.status === 200 && path && path !== '/'
        ? (await probe(`https://${host}${path}`)).slug
        : null)

    if (!slug) {
      return home.status === 429
        ? res.status(429).json({
            error: `${host} is rate-limiting us. Wait a few seconds and retry.`
          })
        : res
            .status(422)
            .json({ error: `Couldn't find a Shopify store at ${host}` })
    }

    cache.set(host, { at: Date.now(), slug })

    res.status(200).json({ slug })
  } catch {
    res.status(502).json({ error: `Couldn't reach ${host}` })
  }
}

export default handler
