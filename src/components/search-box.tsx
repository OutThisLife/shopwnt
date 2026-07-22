'use client'

import { useAtom } from 'jotai'
import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { searchAtom } from '~/lib'
import { cn } from '~/lib/utils'
import { Input } from './ui/input'

export function SearchBox({ className }: { className?: string }) {
  const [query, setQuery] = useAtom(searchAtom)
  const [value, setValue] = useState(query)
  const ref = useRef<HTMLInputElement>(null)

  // Push local input into the atom, debounced to avoid a fetch per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setQuery(value.trim()), 250)

    return () => clearTimeout(id)
  }, [value, setQuery])

  // Pull external atom changes (URL hydration, clear-all) back into the input.
  useEffect(() => {
    setValue(v => (v.trim() === query ? v : query))
  }, [query])

  // Press "/" to jump to the visible search box (skips the hidden breakpoint copy).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) {
        return
      }

      const el = document.activeElement as HTMLElement | null

      if (
        el?.tagName === 'INPUT' ||
        el?.tagName === 'TEXTAREA' ||
        el?.isContentEditable
      ) {
        return
      }

      const input = ref.current

      if (!input || input.offsetParent === null) {
        return
      }

      e.preventDefault()
      input.focus()
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label="Search products"
        className="px-8"
        onChange={e => setValue(e.target.value)}
        placeholder="Search title, category…"
        ref={ref}
        value={value}
      />
      {value ? (
        <button
          aria-label="Clear search"
          className="absolute top-1/2 right-2 grid size-5 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          onClick={() => setValue('')}
          type="button">
          <X className="size-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 select-none rounded border bg-muted px-1.5 font-mono text-[11px] leading-5 text-muted-foreground sm:block">
          /
        </kbd>
      )}
    </div>
  )
}

export default SearchBox
