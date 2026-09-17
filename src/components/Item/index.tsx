'use client'

import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { memo, useCallback, useEffect, useState } from 'react'
import type { Product } from '~/../types'
import {
  arrivedAt,
  relTime,
  revisedAt,
  wasRevised,
  type SortField
} from '~/lib'
import { useBrandName } from '~/lib/use-brand'
import { cn } from '~/lib/utils'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '../ui/carousel'

type ItemProps = Partial<Product> & { sortField?: SortField }

/** Frosted chip shared by everything that floats on the photo. */
const CHIP = 'bg-background/70 backdrop-blur-md'

/** Shared chrome for a size pill; state classes are layered per pill. */
const PILL = cn(
  'inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-border/60 px-2 text-xs font-medium transition-colors',
  CHIP
)

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
const sizesOf = (
  options: Product['options'],
  variants: Product['variants']
) => {
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

/** Keep slide geometry, but don't download a wardrobe of hidden photos. */
function ProductPhotos({ images, title }: Pick<Product, 'images' | 'title'>) {
  const [api, setApi] = useState<CarouselApi>()
  const [loaded, setLoaded] = useState(() => new Set([0]))
  const multi = images.length > 1

  const warmPhotos = useCallback(() => {
    if (!images.length) {
      return
    }

    const at = api?.selectedScrollSnap() ?? 0
    const nearby = [
      at,
      (at + 1) % images.length,
      (at + images.length - 1) % images.length
    ]

    setLoaded(current =>
      nearby.every(i => current.has(i))
        ? current
        : new Set([...current, ...nearby])
    )
  }, [api, images.length])

  useEffect(() => {
    if (!api) {
      return
    }

    api.on('select', warmPhotos)

    return () => {
      api.off('select', warmPhotos)
    }
  }, [api, warmPhotos])

  return (
    <Carousel
      className="size-full"
      onFocusCapture={warmPhotos}
      onPointerEnter={warmPhotos}
      onTouchStart={warmPhotos}
      opts={{ loop: true, watchDrag: multi }}
      setApi={setApi}>
      <CarouselContent className="ml-0 h-full">
        {images.map((img, index) => (
          <CarouselItem className="pl-0" key={img.src}>
            <div className="relative aspect-3/4 w-full overflow-hidden">
              {loaded.has(index) && (
                <div className="card-window absolute inset-0">
                  <Image
                    aria-hidden
                    alt=""
                    className="scale-110 object-cover opacity-[0.07] saturate-75"
                    fill
                    loading={index === 0 ? 'lazy' : 'eager'}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={`${img.src}${img.src.includes('?') ? '&' : '?'}width=64`}
                    unoptimized
                  />
                  <Image
                    alt={title ?? ''}
                    className="object-contain object-center"
                    fill
                    loading={index === 0 ? 'lazy' : 'eager'}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={`${img.src}${img.src.includes('?') ? '&' : '?'}width=1200`}
                    unoptimized
                  />
                </div>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {multi && (
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          <CarouselPrevious className={CHIP} />
          <CarouselNext className={CHIP} />
        </div>
      )}
    </Carousel>
  )
}

function Item({
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
  const price = Number(listPrice)
  const { name: vendorName, resolving: resolvingVendor } = useBrandName(
    vendor ?? ''
  )

  // Show the moment the current sort actually ordered by, so the stamp always
  // explains the position. Price sorts have no moment of their own, so they
  // fall back to arrival.
  const stamps = { created_at, published_at, updated_at }
  const revised = sortField === 'revised' && wasRevised(stamps)
  const at = revised ? revisedAt(stamps) : arrivedAt(stamps)

  const sizes = sizesOf(options, variants)

  return (
    <Card className="card-window-scope group gap-0 overflow-hidden py-0 shadow-none">
      <CardContent className="px-0">
        {/* Card is the photo — meta floats on it, no footer band. */}
        <div className="bg-muted/40 relative aspect-3/4 w-full">
          <ProductPhotos images={images} title={title ?? ''} />

          {/* pointer-events-none so carousel arrows still work; links opt back in. */}
          <div className="pointer-events-none absolute inset-0 z-10">
            {vendor && (
              <p
                className={cn(
                  'text-foreground absolute top-3 left-3 max-w-[calc(100%-5.5rem)] rounded-full px-2.5 py-1 text-xs tracking-wide',
                  resolvingVendor && 'opacity-60',
                  CHIP
                )}>
                {vendorName}
              </p>
            )}

            {Number.isFinite(price) && (
              <Badge
                className="absolute top-3 right-3 backdrop-blur-md"
                variant="success">
                {price.toLocaleString('en-US', {
                  currency: 'USD',
                  style: 'currency'
                })}
              </Badge>
            )}

            <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2">
              <div className={cn('rounded-lg px-2.5 py-2', CHIP)}>
                <a
                  className="hover:text-primary pointer-events-auto inline text-sm leading-snug font-medium hover:underline"
                  href={url}
                  rel="noopener noreferrer"
                  target="_blank">
                  {title}
                  <ExternalLink className="ml-1 inline size-3.5 -translate-y-px opacity-50" />
                </a>
                {at > 0 && (
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {revised ? 'updated' : 'added'} {relTime(new Date(at))}
                  </p>
                )}
              </div>

              {/* Row keeps its height with no sizes so every card gets the
                  same breathing room under the title. */}
              <div className="flex min-h-6 flex-wrap gap-1.5">
                {sizes.map(({ label, href, available }) => {
                  const buyable = available && href

                  return (
                    <a
                      aria-disabled={!buyable}
                      className={cn(
                        PILL,
                        buyable
                          ? 'hover:border-primary hover:text-primary pointer-events-auto'
                          : 'text-muted-foreground line-through opacity-60'
                      )}
                      href={buyable ? href : undefined}
                      key={label}
                      rel="noopener noreferrer"
                      target="_blank"
                      // Cart permalink — cross-origin AJAX to a dozen Shopify
                      // stores isn't possible from here.
                      title={
                        buyable ? `Add ${label} to cart` : `${label} — sold out`
                      }>
                      {label}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(Item)
