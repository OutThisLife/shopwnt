'use client'

import { useAtom, useAtomValue } from 'jotai'
import { Check, Loader2, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { activeSlugsAtom, facetCountAtom, facetsAtom } from '~/lib'
import { useFacets } from '~/lib/use-facets'
import { cn } from '~/lib/utils'
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

export function FacetFilter({ className }: { className?: string }) {
  const brands = useAtomValue(activeSlugsAtom)
  const [selected, setSelected] = useAtom(facetsAtom)
  const count = useAtomValue(facetCountAtom)
  const { facets, loading } = useFacets()
  const [open, setOpen] = useState(false)

  const toggle = (key: string, value: string) =>
    setSelected(s => {
      const on = s[key] ?? []

      return {
        ...s,
        [key]: on.includes(value) ? on.filter(v => v !== value) : [...on, value]
      }
    })

  // Nothing to filter until a brand is on — the groups are read off its catalog.
  if (!brands.length) {
    return null
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button className={cn('gap-2', className)} variant="ghost">
          <SlidersHorizontal className="size-4 opacity-70" />
          <span>Filter</span>
          {count > 0 && (
            <Badge
              className="ml-0.5 h-5 min-w-5 justify-center rounded-full px-1 tabular-nums"
              variant="glass">
              {count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="glass glass-soft w-72 overflow-hidden p-0"
        sideOffset={6}>
        <Command>
          <CommandInput placeholder="Search filters…" />

          <CommandList>
            <CommandEmpty>
              {loading ? 'Reading catalogs…' : 'No filters for these brands.'}
            </CommandEmpty>

            {loading && !facets.length && (
              <CommandGroup>
                <CommandItem disabled value="loading">
                  <Loader2 className="size-3.5 animate-spin opacity-60" />
                  Reading catalogs…
                </CommandItem>
              </CommandGroup>
            )}

            {facets.map(f => (
              <CommandGroup heading={f.label} key={f.key}>
                {f.values.map(v => {
                  const on = selected[f.key]?.includes(v.value) ?? false

                  return (
                    <CommandItem
                      key={v.value}
                      onSelect={() => toggle(f.key, v.value)}
                      value={`${f.label} ${v.value}`}>
                      <span className="flex-1 truncate">{v.value}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {v.count}
                      </span>
                      <Check
                        className={cn('text-primary', on ? 'opacity-100' : 'opacity-0')}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}

            {count > 0 && (
              <CommandGroup>
                <CommandItem onSelect={() => setSelected({})} value="clear filters">
                  <X className="text-muted-foreground" />
                  Clear filters
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default FacetFilter
