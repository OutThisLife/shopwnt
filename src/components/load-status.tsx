'use client'

import { useIsFetching } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { brandsReadyAtom, slugsAtom } from '~/lib'
import { cn } from '~/lib/utils'

/** Below this a spinner is a flicker, not information. */
const MIN_VISIBLE = 400

/**
 * The bar's own activity light.
 *
 * Products and facets both fetch off the same brand set, so one indicator
 * covers the whole toolbar rather than each control sprouting its own spinner.
 * It holds briefly after settling so a fast response reads as a beat instead of
 * a flash, and it occupies a fixed width so the pill never resizes around it.
 */
export function LoadStatus({ className }: { className?: string }) {
  const brandsReady = useAtomValue(brandsReadyAtom)
  const slugs = useAtomValue(slugsAtom)
  const products = useIsFetching({ queryKey: ['products'] })
  const facets = useIsFetching({ queryKey: ['facets'] })

  // Read the raw map, not activeSlugs — that one is empty until the healthcheck
  // finishes, which is exactly the stretch this most needs to cover.
  const any = Object.values(slugs).some(Boolean)
  const busy = any && (!brandsReady || products > 0 || facets > 0)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (busy) {
      setShown(true)

      return
    }

    const id = setTimeout(() => setShown(false), MIN_VISIBLE)

    return () => clearTimeout(id)
  }, [busy])

  return (
    <span
      aria-live="polite"
      className={cn(
        // Always mounted at a fixed size: unmounting it would remeasure the
        // pill and set the whole bar springing every time a fetch settles.
        'grid size-4 shrink-0 place-items-center transition-opacity duration-200',
        shown ? 'opacity-100' : 'opacity-0',
        className
      )}
      role="status">
      <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
      <span className="sr-only">{shown ? 'Loading' : 'Idle'}</span>
    </span>
  )
}

export default LoadStatus
