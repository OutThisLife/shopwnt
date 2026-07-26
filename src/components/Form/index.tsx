'use client'

import { useAtomValue } from 'jotai'
import { useLayoutEffect, useRef, useState } from 'react'
import { paletteAtom } from '~/lib'
import { cn } from '~/lib/utils'
import { BrandFilter } from '../brand-filter'
import { FacetFilter } from '../facet-filter'
import { SortSelect } from '../sort-select'

// Ghost controls, so the pill reads as one surface instead of nested boxes.
// Hover, active and focus come from the `glass` interaction rules in
// globals.css — solid accent fills would read as stickers on the pane.
const CONTROL = 'h-8 rounded-full border-0 bg-transparent shadow-none'

export default function Toolbar() {
  const palette = useAtomValue(paletteAtom)
  const content = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>()

  // The pill resizes whenever the sort label or the brand count changes. CSS
  // can't tween that on its own — `width: auto` computes to `auto` either side
  // of the change, so there's nothing to interpolate. Measuring the content and
  // pinning the pill to it gives the transition a real number to work with.
  useLayoutEffect(() => {
    const el = content.current

    if (!el) {
      return
    }

    const observer = new ResizeObserver(() => setWidth(el.offsetWidth))

    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={cn(
        // content-box so the measured content width maps straight onto the pill.
        'glass glass-springy fixed top-(--bar-inset) left-1/2 z-40 box-content -translate-x-1/2 rounded-full',
        // The palette lands in this exact spot, so hand the space over to it.
        palette && 'pointer-events-none scale-95 opacity-0'
      )}
      data-slot="toolbar"
      style={{ width }}>
      <div className="flex w-max items-center gap-1 p-1" ref={content}>
        <SortSelect className={CONTROL} />
        <FacetFilter className={CONTROL} />
        <BrandFilter className={CONTROL} />
      </div>
    </header>
  )
}
