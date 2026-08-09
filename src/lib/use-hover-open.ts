'use client'

import { useCallback, useEffect, useRef, type PointerEvent } from 'react'

/** Long enough that crossing a trigger on the way somewhere else is ignored. */
const OPEN_DELAY = 120

/** Grace to cross the gap between the trigger and the panel. */
const CLOSE_DELAY = 220

/**
 * Every panel currently up, by the call that dismisses it. Once one is open the
 * bar behaves like a menu bar: moving along it swaps panels on contact instead
 * of waiting out the intent delay, and the one being left goes at once rather
 * than cross-fading with its replacement.
 */
const panels = new Set<() => void>()

/**
 * Opens a Popover on hover, with the delays that keep it from being a hair
 * trigger. Click still works, and touch is left alone — a tap has no hover to
 * precede it, so pointer opening would fire and close in the same gesture.
 *
 * Spread `trigger` onto PopoverTrigger and `content` onto PopoverContent. Both
 * are needed: the panel has to cancel the pending close as the cursor arrives.
 */
export function useHoverOpen(open: boolean, setOpen: (open: boolean) => void) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Hovering shouldn't pull focus off whatever the user was doing, but a click
  // or a keypress should still land them in the panel.
  const byHover = useRef(false)

  const close = useCallback(() => setOpen(false), [setOpen])

  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    if (!open) {
      return
    }

    for (const other of panels) {
      other()
    }

    panels.add(close)

    return () => {
      panels.delete(close)
    }
  }, [close, open])

  const cancel = () => clearTimeout(timer.current)

  const schedule = (next: boolean, delay: number) => {
    cancel()
    timer.current = setTimeout(() => setOpen(next), delay)
  }

  const enter = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') {
      return
    }

    byHover.current = true
    schedule(true, panels.size ? 0 : OPEN_DELAY)
  }

  const leave = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') {
      return
    }

    schedule(false, CLOSE_DELAY)
  }

  const keepFocus = (e: Event) => {
    if (byHover.current) {
      e.preventDefault()
    }
  }

  return {
    trigger: {
      onPointerEnter: enter,
      onPointerLeave: leave,
      // A deliberate click should land in the panel, unlike drifting over it.
      onPointerDown: () => {
        byHover.current = false
        cancel()
      }
    },
    content: {
      onCloseAutoFocus: keepFocus,
      onOpenAutoFocus: keepFocus,
      onPointerEnter: cancel,
      onPointerLeave: leave
    }
  } as const
}
