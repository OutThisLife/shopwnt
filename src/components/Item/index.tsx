'use client'

import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Loading from '~/app/loading'
import type { Product } from '~/../types'
import { clean, gql, gqlFetch, relTime, type SortField } from '~/lib'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '../ui/carousel'

const QUERY = gql`
  query GetProduct($id: [ID!], $handle: [ID!]!) {
    products(where: { id_IN: $id, handle_IN: $handle }, options: { limit: 1 }) {
      price
      title
      url
      images {
        src
        width
        height
      }
    }
  }
`

const STAMP_LABEL: Record<SortField, string> = {
  created_at: 'added',
  published_at: 'published',
  updated_at: 'updated',
  price: 'added'
}

type ItemProps = Partial<Product> & { sortField?: SortField }

export default function Item({
  handle,
  vendor,
  price: listPrice,
  created_at,
  published_at,
  updated_at,
  sortField = 'created_at'
}: ItemProps) {
  const { data, isPending } = useQuery({
    enabled: !!(handle && vendor),
    queryKey: ['product', { handle: [clean(vendor ?? '')], id: [handle] }],
    queryFn: ({ queryKey: [, args] }) =>
      gqlFetch<{ products: Product[] }>(
        QUERY,
        args as Record<string, unknown>
      ).then(r => r.products?.[0]),
    staleTime: Infinity
  })

  if (isPending || !data) {
    return <Loading />
  }

  const images = data.images ?? []
  const multi = images.length > 1
  const price = Number(listPrice ?? data.price)

  const stampField = sortField === 'price' ? 'created_at' : sortField
  const stamp =
    { created_at, published_at, updated_at }[stampField] ??
    published_at ??
    created_at

  return (
    <Card className="group gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <div className="flex w-full items-start justify-between gap-3 px-6 py-4">
        <div className="min-w-0 flex-1">
          <a
            className="flex min-w-0 items-center gap-1 font-medium leading-snug hover:text-primary hover:underline"
            href={data.url}
            rel="noopener noreferrer"
            target="_blank">
            <span className="truncate">{data.title}</span>
            <ExternalLink className="size-3.5 shrink-0 opacity-50" />
          </a>
          <p className="mt-0.5 truncate text-xs tracking-wide text-muted-foreground uppercase">
            {vendor}
            {stamp && ` · ${STAMP_LABEL[stampField]} ${relTime(stamp)}`}
          </p>
        </div>

        {Number.isFinite(price) && (
          <Badge className="shrink-0" variant="success">
            {price.toLocaleString('en-US', {
              currency: 'USD',
              style: 'currency'
            })}
          </Badge>
        )}
      </div>

      <CardContent className="px-0">
        <Carousel
          className="bg-muted/40"
          opts={{ loop: true, watchDrag: multi }}>
          <CarouselContent className="ml-0">
            {images.map(img => (
              <CarouselItem className="pl-0" key={img.src}>
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    alt={data.title ?? ''}
                    className="object-contain object-center"
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={img.src}
                    unoptimized
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {multi && (
            <div className="opacity-0 transition-opacity group-hover:opacity-100">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          )}
        </Carousel>
      </CardContent>
    </Card>
  )
}
