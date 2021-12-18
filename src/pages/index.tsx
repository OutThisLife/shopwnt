import * as React from 'react'
import { SWRConfig } from 'swr'
import type { Product } from '~/../types'
import { fetcher } from '~/lib'
import { Home } from '~/templates'

export default function Index({ fallback }: { fallback: Product[] }) {
  return (
    <SWRConfig value={{ fallback }}>
      <Home />
    </SWRConfig>
  )
}

export async function getStaticProps() {
  const data = await fetcher(
    `https://loveshackfancy.myshopify.com/products.json?limit=150`
  )

  return { props: { fallback: [{ ...data, vendor: 'loveshackfancy' }] } }
}
