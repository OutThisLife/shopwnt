'use client'

import { useSetAtom } from 'jotai'
import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { searchAtom } from '~/lib'
import { cn } from '~/lib/utils'
import { Input } from './ui/input'

export function SearchBox({ className }: { className?: string }) {
  const setQuery = useSetAtom(searchAtom)
  const [value, setValue] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setQuery(value.trim()), 250)

    return () => clearTimeout(id)
  }, [value, setQuery])

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label="Search products"
        className="px-8"
        onChange={e => setValue(e.target.value)}
        placeholder="Search title, category…"
        value={value}
      />
      {value && (
        <button
          aria-label="Clear search"
          className="absolute top-1/2 right-2 grid size-5 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          onClick={() => setValue('')}
          type="button">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export default SearchBox
