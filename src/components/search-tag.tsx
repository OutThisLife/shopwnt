'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { paletteAtom, searchAtom } from '~/lib'
import { cn } from '~/lib/utils'

/**
 * Opens the command palette, and shows the live query once there is one.
 *
 * The palette is the only way to search, so without a visible affordance the
 * feature is a keyboard secret. This is the affordance — and when a search is
 * active it doubles as the indicator that the grid is narrowed.
 */
export function SearchTag({ className }: { className?: string }) {
  const open = useSetAtom(paletteAtom)
  const query = useAtomValue(searchAtom)
  const [mac, setMac] = useState(false)

  // navigator is client-only, so the hint resolves after mount rather than
  // guessing during SSR and hydrating to a mismatch.
  useEffect(() => {
    setMac(/mac/i.test(navigator.platform))
  }, [])

  return (
    <button
      className={cn(
        'flex cursor-pointer items-center gap-1.5 rounded-full px-2 text-sm outline-hidden',
        className
      )}
      onClick={() => open(true)}
      type="button">
      <Search className="size-4 shrink-0 opacity-70" />
      {query ? (
        <span className="max-w-32 truncate">{query}</span>
      ) : (
        <kbd className="pointer-events-none font-sans text-xs tracking-wide text-muted-foreground">
          {mac ? '⌘K' : 'Ctrl K'}
        </kbd>
      )}
    </button>
  )
}

export default SearchTag
