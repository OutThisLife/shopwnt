'use client'

import { useAtom } from 'jotai'
import { Check, Plus, Store } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { slugsAtom } from '~/lib'
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

export function BrandFilter() {
  const [slugs, setSlugs] = useAtom(slugsAtom)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)

  const brands = Object.keys(slugs)
  const activeCount = Object.values(slugs).filter(Boolean).length
  const term = query.trim().toLowerCase()

  const toggle = (k: string) => setSlugs(s => ({ ...s, [k]: !s[k] }))

  const addBrand = async (raw: string) => {
    const v = raw.trim()

    if (!v || adding) {
      return
    }

    setAdding(true)
    const id = toast.loading('Verifying Shopify domain…', { description: v })

    try {
      const res = await fetch(`/api/verify?u=${encodeURIComponent(v)}`)

      if (!res.ok) {
        throw new Error('Not a Shopify store')
      }

      const { slug } = await res.json()

      setSlugs(s => ({ ...s, [slug]: true }))
      setQuery('')
      toast.success('Brand added', { id, description: slug })
    } catch {
      toast.error('Not a Shopify store', {
        id,
        description: `Couldn't verify “${v}”`
      })
    } finally {
      setAdding(false)
    }
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button className="gap-2" variant="outline">
          <Store className="size-4 opacity-70" />
          <span>Brands</span>
          {activeCount > 0 && (
            <Badge
              className="ml-0.5 h-5 min-w-5 justify-center rounded-full px-1"
              variant="default">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-0">
        <Command>
          <CommandInput
            onValueChange={setQuery}
            placeholder="Search or add a store…"
            value={query}
          />
          <CommandList>
            <CommandEmpty>No brands found.</CommandEmpty>

            <CommandGroup heading="Brands">
              {brands.map(k => (
                <CommandItem key={k} onSelect={() => toggle(k)} value={k}>
                  <Check
                    className={cn(
                      'text-primary',
                      slugs[k] ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="truncate">{k}</span>
                </CommandItem>
              ))}

              {term && !brands.some(b => b.toLowerCase() === term) && (
                <CommandItem
                  disabled={adding}
                  onSelect={() => addBrand(query)}
                  value={`add ${query}`}>
                  <Plus className="text-muted-foreground" />
                  <span className="truncate">
                    Add “{query.trim()}”
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
