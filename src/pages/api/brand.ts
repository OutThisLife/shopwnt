import type { NextApiRequest, NextApiResponse } from 'next'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const SLUG = /^[a-z0-9][a-z0-9-]*$/
const TTL = 24 * 60 * 60_000
const cache = new Map<string, { at: number; name: string }>()

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ name: string } | { error: string }>
) => {
  const slug = String(req.query.slug ?? '')
    .trim()
    .toLowerCase()

  if (!SLUG.test(slug)) {
    return res.status(400).json({ error: 'Invalid store slug.' })
  }

  const hit = cache.get(slug)

  if (hit && Date.now() - hit.at < TTL) {
    return res.status(200).json({ name: hit.name })
  }

  try {
    const upstream = await fetch(`https://${slug}.myshopify.com/meta.json`, {
      headers: { 'User-Agent': UA, Accept: 'application/json' }
    })
    const meta = (await upstream.json().catch(() => null)) as {
      name?: string
    } | null
    const name = meta?.name?.trim()

    if (!upstream.ok || !name) {
      return res.status(404).json({ error: 'Store name unavailable.' })
    }

    cache.set(slug, { at: Date.now(), name })

    return res.status(200).json({ name })
  } catch {
    return res.status(502).json({ error: 'Store name unavailable.' })
  }
}

export default handler
