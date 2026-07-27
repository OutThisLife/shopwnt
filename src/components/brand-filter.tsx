'use client'

import { useAtomValue } from 'jotai'
import { Loader2, Plus, Store } from 'lucide-react'
import { useMemo, useState } from 'react'
import { brandsReadyAtom, slugsAtom, storeHost } from '~/lib'
import { useAddBrand } from '~/lib/use-add-brand'
import { useBrandToggle } from '~/lib/use-brand-toggle'
import { cn } from '~/lib/utils'
import { Button } from './ui/button'
import {
  DROPDOWN_COLUMN,
  DROPDOWN_PANEL,
  DropdownColumn,
  DropdownNotice,
  DropdownRow,
  DropdownSearch
} from './ui/dropdown'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

/** Past this many brands one column becomes a scroll chore, so it splits. */
const PER_COLUMN = 4
const MAX_COLUMNS = 3

export function BrandFilter({ className }: { className?: string }) {
  const slugs = useAtomValue(slugsAtom)
  const brandsReady = useAtomValue(brandsReadyAtom)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { addBrand, adding } = useAddBrand()
  const { toggle, pending } = useBrandToggle()

  const brands = Object.keys(slugs)
  const term = query.trim().toLowerCase()
  const shown = term ? brands.filter(b => b.toLowerCase().includes(term)) : brands

  // Balanced columns rather than filling one before starting the next, so the
  // panel stays a tidy block instead of an L.
  const columns = useMemo(() => {
    const n = Math.min(Math.ceil(shown.length / PER_COLUMN) || 1, MAX_COLUMNS)
    const per = Math.ceil(shown.length / n)

    return Array.from({ length: n }, (_, i) => shown.slice(i * per, (i + 1) * per))
  }, [shown])

  const add = async () => {
    if (await addBrand(query)) {
      setQuery('')
    }
  }

  const canAdd = brandsReady && term && !brands.some(b => b.toLowerCase() === term)

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button className={cn('gap-2', className)} variant="ghost">
          <Store className="size-4 opacity-70" />
          <span>Brands</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        className={cn(DROPDOWN_PANEL, 'max-w-[min(92vw,34rem)]')}
        sideOffset={6}>
        <div className="flex flex-col">
          <DropdownSearch
            icon={Store}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && canAdd) {
                add()
              }
            }}
            placeholder="Search or add a store…"
            value={query}
          />

          {!brandsReady ? (
            <DropdownNotice busy>Checking stores…</DropdownNotice>
          ) : !shown.length && !canAdd ? (
            <DropdownNotice>No brands found.</DropdownNotice>
          ) : (
            <div className="flex overflow-x-auto">
              {columns.map((col, i) => (
                <DropdownColumn className={DROPDOWN_COLUMN} key={i}>
                  {col.map(k => (
                    <DropdownRow active={slugs[k]} key={k} onClick={() => toggle(k)}>
                      <span className="flex-1 truncate">{k}</span>
                      {pending.includes(k) && (
                        <Loader2 className="size-3.5 shrink-0 animate-spin opacity-60" />
                      )}
                    </DropdownRow>
                  ))}
                </DropdownColumn>
              ))}
            </div>
          )}

          {canAdd && (
            <div className="px-1 pb-1">
              <DropdownRow className="w-full" disabled={adding} onClick={add}>
                {adding ? (
                  <Loader2 className="size-3.5 shrink-0 animate-spin opacity-60" />
                ) : (
                  <Plus className="size-3.5 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate">
                  Add “{storeHost(query) || query.trim()}”
                </span>
              </DropdownRow>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default BrandFilter
