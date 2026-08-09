'use client'

import { useAtomValue } from 'jotai'
import { Plus, Store } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  activeSlugsAtom,
  brandSlugsAtom,
  brandsReadyAtom,
  storeHost
} from '~/lib'
import { useAddBrand } from '~/lib/use-add-brand'
import { useBrand } from '~/lib/use-brand'
import { useHoverOpen } from '~/lib/use-hover-open'
import { cn } from '~/lib/utils'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  DROPDOWN_COLUMN,
  DROPDOWN_PANEL,
  DropdownCheck,
  DropdownColumn,
  DropdownNotice,
  DropdownRow,
  DropdownSearch
} from './ui/dropdown'
import { Loader } from './ui/loader'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

/** Past this many brands one column becomes a scroll chore, so it splits. */
const PER_COLUMN = 4
const MAX_COLUMNS = 3

function BrandOption({ slug }: { slug: string }) {
  const { active, name, pending, resolving, toggle } = useBrand(slug)

  return (
    <DropdownRow active={active} onClick={toggle}>
      <span className={cn('flex-1', resolving && 'opacity-60')}>{name}</span>
      {pending ? (
        <Loader className="opacity-60" />
      ) : (
        <DropdownCheck active={active} />
      )}
    </DropdownRow>
  )
}

export function BrandFilter({ className }: { className?: string }) {
  const brands = useAtomValue(brandSlugsAtom)
  const activeCount = useAtomValue(activeSlugsAtom).length
  const brandsReady = useAtomValue(brandsReadyAtom)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { addBrand, adding } = useAddBrand()
  const hover = useHoverOpen(open, setOpen)

  const term = query.trim().toLowerCase()
  const shown = term
    ? brands.filter(b => b.toLowerCase().includes(term))
    : brands

  // Balanced columns rather than filling one before starting the next, so the
  // panel stays a tidy block instead of an L.
  const columns = useMemo(() => {
    const n = Math.min(Math.ceil(shown.length / PER_COLUMN) || 1, MAX_COLUMNS)
    const per = Math.ceil(shown.length / n)

    return Array.from({ length: n }, (_, i) =>
      shown.slice(i * per, (i + 1) * per)
    )
  }, [shown])

  const add = async () => {
    if (await addBrand(query)) {
      setQuery('')
    }
  }

  const canAdd =
    brandsReady && term && !brands.some(b => b.toLowerCase() === term)

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild {...hover.trigger}>
        <Button className={cn('gap-2', className)} variant="ghost">
          <Store className="size-4 opacity-70" />
          <span>Brands</span>
          {activeCount > 0 && (
            <Badge className="h-5 min-w-5 rounded-full px-1.5" variant="glass">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        className={cn(DROPDOWN_PANEL, 'max-w-[min(92vw,34rem)]')}
        sideOffset={6}
        {...hover.content}>
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
                  {col.map(slug => (
                    <BrandOption key={slug} slug={slug} />
                  ))}
                </DropdownColumn>
              ))}
            </div>
          )}

          {canAdd && (
            <div className="px-1 pb-1">
              <DropdownRow className="w-full" disabled={adding} onClick={add}>
                {adding ? (
                  <Loader className="opacity-60" />
                ) : (
                  <Plus className="text-muted-foreground size-3.5 shrink-0" />
                )}
                <span>Add “{storeHost(query) || query.trim()}”</span>
              </DropdownRow>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default BrandFilter
