'use client'

import { useAtom } from 'jotai'
import { X } from 'lucide-react'
import { slugsAtom } from '~/lib'
import { BrandFilter } from '../brand-filter'
import { ModeToggle } from '../mode-toggle'
import { SortSelect } from '../sort-select'
import { Badge } from '../ui/badge'

export default function Toolbar() {
  const [slugs, setSlugs] = useAtom(slugsAtom)

  const active = Object.entries(slugs)
    .filter(([, v]) => v)
    .map(([k]) => k)

  const remove = (k: string) => setSlugs(s => ({ ...s, [k]: false }))

  return (
    <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <span className="text-lg font-semibold tracking-tight">
          shopwnt
        </span>

        <div className="ml-auto flex items-center gap-2">
          <SortSelect className="hidden sm:flex" />
          <BrandFilter />
          <ModeToggle />
        </div>
      </div>

      {active.length > 0 && (
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1.5 px-4 pb-3 sm:px-6">
          <span className="mr-0.5 text-xs text-muted-foreground">Filtering</span>
          {active.map(k => (
            <Badge className="gap-1 pr-1 pl-2" key={k} variant="secondary">
              {k}
              <button
                aria-label={`Remove ${k}`}
                className="grid size-4 place-items-center rounded-full transition-colors hover:bg-foreground/15"
                onClick={() => remove(k)}
                type="button">
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </header>
  )
}
