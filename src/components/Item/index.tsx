'use client'

import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import type { Product } from '~/../types'
import { arrivedAt, relTime, revisedAt, wasRevised, type SortField } from '~/lib'
import { cn } from '~/lib/utils'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '../ui/carousel'

type ItemProps = Partial<Product> & { sortField?: SortField }

/** Shared chrome for a size pill; state classes are layered per pill. */
const PILL =
  'inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-2 text-xs font-medium transition-colors'

interface SizePill {
  label: string
  href?: string
  available: boolean
}

/**
 * One pill per size, in catalog order.
 *
 * Shopify carries option values on variant option1/2/3, positionally matching
 * the product's `options`, so the size lives in whichever slot the size option
 * occupies. Where two variants share a label the available one wins the pill,
 * but the first cart URL is kept so a sold-out size still links somewhere.
 */
const sizesOf = (options: Product['options'], variants: Product['variants']) => {
  const idx = (options ?? []).findIndex(
    o => `${o?.name ?? ''}`.toLowerCase() === 'size'
  )

  if (idx < 0) {
    return []
  }

  const byLabel = new Map<string, SizePill>()

  for (const v of variants ?? []) {
    const label = [v.option1, v.option2, v.option3][idx]?.trim()
    const hit = label && byLabel.get(label)

    if (label && (!hit || (v.available && !hit.available))) {
      byLabel.set(label, {
        label,
        href: v.cartUrl ?? undefined,
        available: !!v.available
      })
    }
  }

  return [...byLabel.values()]
}

export default function Item({
  title,
  url,
  vendor,
  price: listPrice,
  images = [],
  options = [],
  variants = [],
  created_at,
  published_at,
  updated_at,
  sortField = 'arrived'
}: ItemProps) {
  const multi = images.length > 1
  const price = Number(listPrice)

  // Show the moment the current sort actually ordered by, so the stamp always
  // explains the position. Price sorts have no moment of their own, so they
  // fall back to arrival.
  const stamps = { created_at, published_at, updated_at }
  const revised = sortField === 'revised' && wasRevised(stamps)
  const at = revised ? revisedAt(stamps) : arrivedAt(stamps)

  const sizes = sizesOf(options, variants)

  return (
    <Card className="group gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <div className="flex w-full items-start justify-between gap-3 px-6 py-4">
        <div className="min-w-0 flex-1">
          <a
            className="flex min-w-0 items-center gap-1 font-medium leading-snug hover:text-primary hover:underline"
            href={url}
            rel="noopener noreferrer"
            target="_blank">
            <span className="truncate">{title}</span>
            <ExternalLink className="size-3.5 shrink-0 opacity-50" />
          </a>
          <p className="mt-0.5 truncate text-xs tracking-wide text-muted-foreground uppercase">
            {vendor}
            {at > 0 && ` · ${revised ? 'updated' : 'added'} ${relTime(new Date(at))}`}
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
                <div className="relative aspect-3/4 w-full">
                  <Image
                    alt={title ?? ''}
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

        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-6 pt-3 pb-4">
            {sizes.map(({ label, href, available }) => {
              const buyable = available && href

              return (
                <a
                  aria-disabled={!buyable}
                  className={cn(
                    PILL,
                    buyable
                      ? 'hover:border-primary hover:text-primary'
                      : 'pointer-events-none text-muted-foreground line-through opacity-60'
                  )}
                  href={buyable ? href : undefined}
                  key={label}
                  rel="noopener noreferrer"
                  target="_blank"
                  // A cart permalink lands the browser on that store's cart with
                  // the variant already in it — cross-origin AJAX to a dozen
                  // different Shopify stores isn't possible from here.
                  title={buyable ? `Add ${label} to cart` : `${label} — sold out`}>
                  {label}
                </a>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
