import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const t = await (
      await fetch(`https://${req.query?.u?.replace(/^(https?:\/\/|\/\/)/, '')}`)
    ).text()

    const m = t.match(/([A-z0-9-_]+)\.myshopify\.com/)

    if (!m?.length) {
      throw new Error('Not a valid shopify site')
    }

    res.status(200).json({ slug: m?.at(1) })
  } catch (err: any) {
    res.status(500).end()
  }
}
