import type { NextApiRequest, NextApiResponse } from 'next'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

const SLUG = /^[a-z0-9][a-z0-9-]*$/

const check = async (slug: string): Promise<boolean> => {
  try {
    const res = await fetch(
      `https://${slug}.myshopify.com/products.json?limit=1`,
      { cache: 'no-store', headers: { 'User-Agent': UA, Accept: 'application/json' } }
    )

    return res.ok
  } catch {
    return false
  }
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ results: Record<string, boolean> } | { error: string }>
) => {
  const raw = String(req.query.slugs ?? req.query.slug ?? '').trim()

  if (!raw) {
    return res.status(400).json({ error: 'Missing slug(s).' })
  }

  const slugs = [...new Set(raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean))]

  if (!slugs.length || slugs.some(s => !SLUG.test(s))) {
    return res.status(400).json({ error: 'Invalid slug(s).' })
  }

  const pairs = await Promise.all(slugs.map(async slug => [slug, await check(slug)] as const))

  res.status(200).json({ results: Object.fromEntries(pairs) })
}

export default handler
