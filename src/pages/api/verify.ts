import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const t = await (
      await fetch(
        `https://${(req.query?.u as string)?.replace(
          /^(https?:\/\/|\/\/)/,
          ''
        )}`
      )
    ).text()

    const m = t.match(/([A-z0-9-_]+)\.myshopify\.com/)

    if (!m?.length) {
      throw new Error('Not a valid shopify site')
    }

    res.status(200).json({ slug: m?.at(1) })
  } catch {
    res.status(500).end()
  }
}

export default handler
