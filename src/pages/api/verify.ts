import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const t = await (
      await fetch(
        `https://${String(req.query.u ?? 'google.com').replace(
          /^(https?:\/\/|\/\/)/,
          ''
        )}`
      )
    ).text()

    const m = t.match(/([A-z0-9-_]+)\.myshopify\.com/)

    if (!m?.length) {
      throw new Error('Not a valid shopify site')
    }

    res.status(200).json({ slug: m?.[1] })
  } catch (err: any) {
    res.status(500).end()
  }
}
