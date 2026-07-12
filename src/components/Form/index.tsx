'use client'

import { useAtom } from 'jotai'
import { X } from 'lucide-react'
import { slugsAtom } from '~/lib'
import { BrandFilter } from '../brand-filter'
import { ModeToggle } from '../mode-toggle'
import { SearchBox } from '../search-box'
import { SortSelect } from '../sort-select'

export default function Toolbar() {
  const [slugs, setSlugs] = useAtom(slugsAtom)

  const active = Object.entries(slugs)
    .filter(([, v]) => v)
    .map(([k]) => k)

  const remove = (k: string) => setSlugs(s => ({ ...s, [k]: false }))

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <span className="shrink-0 text-lg font-semibold tracking-tight">
          sho
          <span className="bg-gradient-to-r from-foreground from-50% to-primary to-50% bg-clip-text text-transparent">
            p
          </span>
          <span className="text-primary">wnt</span>
        </span>

        <div className="flex min-w-0 flex-1 justify-center px-1 sm:px-3">
          <SearchBox className="w-full max-w-md" />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SortSelect className="hidden md:flex" />
          <BrandFilter />
          <span className="mx-0.5 hidden h-5 w-px bg-border sm:block" />
          <ModeToggle />
        </div>
      </div>

      {active.length > 0 && (
        <div className="mx-auto -mt-1 flex max-w-6xl flex-wrap items-center gap-1.5 px-4 pb-3 sm:px-6">
          <span className="mr-1 text-xs font-medium text-muted-foreground">
            Filtering
          </span>

          {active.map(k => (
            <button
              className="group inline-flex items-center gap-1 rounded-full border bg-secondary/60 py-0.5 pr-1.5 pl-2.5 text-xs font-medium transition-colors hover:bg-secondary"
              key={k}
              onClick={() => remove(k)}
              type="button">
              {k}
              <X className="size-3 text-muted-foreground transition-colors group-hover:text-foreground" />
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
