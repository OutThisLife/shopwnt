'use client'

import { useAtom, useAtomValue } from 'jotai'
import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { paletteAtom, searchAtom, slugsAtom, brandsReadyAtom, storeHost } from '~/lib'
import { useAddBrand } from '~/lib/use-add-brand'
import { useBrandToggle } from '~/lib/use-brand-toggle'
import { cn } from '~/lib/utils'
import { BrandItem } from './brand-item'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'

function Palette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useAtom(searchAtom)
  const slugs = useAtomValue(slugsAtom)
  const brandsReady = useAtomValue(brandsReadyAtom)
  const [value, setValue] = useState(query)
  const { addBrand, adding } = useAddBrand()
  const { toggle, pending } = useBrandToggle()
  const ref = useRef<HTMLDivElement>(null)

  const term = value.trim().toLowerCase()
  const brands = brandsReady
    ? Object.keys(slugs).filter(b => b.includes(term))
    : []
  // The input doubles as the product search, so only offer to add a store when
  // what's typed is domain-shaped — the same thing /api/verify insists on.
  const host = storeHost(value)
  const canAdd = host.includes('.')
  const hasList = brandsReady && (brands.length > 0 || canAdd)

  // Push into the atom debounced so the grid behind re-queries once per pause,
  // not once per keystroke. A domain is an add-a-store command rather than a
  // product query, so it leaves the grid alone.
  useEffect(() => {
    if (canAdd) {
      return
    }

    const id = setTimeout(() => setQuery(value.trim()), 250)

    return () => clearTimeout(id)
  }, [value, canAdd, setQuery])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)

    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [onClose])

  const add = async () => {
    if (await addBrand(value)) {
      setValue('')
    }
  }

  return (
    // Deliberately no overlay: the grid behind stays scrollable and clickable so
    // you can watch it filter as you type.
    <div className="pointer-events-none fixed inset-x-0 top-(--bar-inset) z-50 flex justify-center px-4">
      <Command
        className="glass pointer-events-auto w-full max-w-lg rounded-xl border animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
        onKeyDown={e => {
          if (e.key === 'Escape' || (e.key === 'Enter' && !hasList)) {
            onClose()
          }
        }}
        ref={ref}
        shouldFilter={false}>
        <CommandInput
          autoFocus
          className="text-base"
          onValueChange={setValue}
          placeholder="Search products, or add a store…"
          value={value}
          wrapperClassName={cn('h-14 gap-3 px-4 [&>svg]:size-5', !hasList && 'border-b-0')}
        />

        {hasList && (
          <CommandList>
            <CommandGroup heading="Brands">
              {brands.map(b => (
                <BrandItem
                  active={slugs[b]}
                  key={b}
                  onToggle={() => toggle(b)}
                  pending={pending.includes(b)}
                  slug={b}
                />
              ))}

              {canAdd && (
                <CommandItem disabled={adding} onSelect={add} value={`add ${host}`}>
                  <Plus className="text-muted-foreground" />
                  <span className="truncate">Add “{host}”</span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  )
}

export function CommandPalette() {
  const [open, setOpen] = useAtom(paletteAtom)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(o => !o)

        return
      }

      const el = document.activeElement as HTMLElement | null
      const typing =
        el?.tagName === 'INPUT' ||
        el?.tagName === 'TEXTAREA' ||
        el?.isContentEditable

      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return open ? <Palette onClose={() => setOpen(false)} /> : null
}

export default CommandPalette
