'use client'

import { useAtomValue } from 'jotai'
import { Plus, Store } from 'lucide-react'
import { useState } from 'react'
import { slugsAtom, brandsReadyAtom, storeHost } from '~/lib'
import { useAddBrand } from '~/lib/use-add-brand'
import { useBrandToggle } from '~/lib/use-brand-toggle'
import { cn } from '~/lib/utils'
import { BrandItem } from './brand-item'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export function BrandFilter({ className }: { className?: string }) {
  const slugs = useAtomValue(slugsAtom)
  const brandsReady = useAtomValue(brandsReadyAtom)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { addBrand, adding } = useAddBrand()
  const { toggle, pending } = useBrandToggle()

  const brands = Object.keys(slugs)
  const activeCount = Object.values(slugs).filter(Boolean).length
  const term = query.trim().toLowerCase()

  const add = async () => {
    if (await addBrand(query)) {
      setQuery('')
    }
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button className={cn('gap-2', className)} variant="ghost">
          <Store className="size-4 opacity-70" />
          <span>Brands</span>
          {activeCount > 0 && (
            <Badge
              className="ml-0.5 h-5 min-w-5 justify-center rounded-full px-1 tabular-nums"
              variant="glass">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="glass glass-soft w-72 overflow-hidden p-0" sideOffset={6}>
        <Command>
          <CommandInput
            onValueChange={setQuery}
            placeholder="Search or add a store…"
            value={query}
          />
          <CommandList>
            <CommandEmpty>No brands found.</CommandEmpty>

            <CommandGroup heading="Brands">
              {!brandsReady ? (
                <CommandItem disabled value="checking">
                  Checking stores…
                </CommandItem>
              ) : (
                brands.map(k => (
                  <BrandItem
                    active={slugs[k]}
                    key={k}
                    onToggle={() => toggle(k)}
                    pending={pending.includes(k)}
                    slug={k}
                  />
                ))
              )}

              {brandsReady && term && !brands.some(b => b.toLowerCase() === term) && (
                <CommandItem
                  disabled={adding}
                  onSelect={add}
                  value={`add ${query}`}>
                  <Plus className="text-muted-foreground" />
                  <span className="truncate">
                    Add “{storeHost(query) || query.trim()}”
                  </span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default BrandFilter
