'use client'

import { useAtom, useAtomValue } from 'jotai'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { activeSlugsAtom, facetCountAtom, facetsAtom, searchAtom } from '~/lib'
import { useFacets, type Facet } from '~/lib/use-facets'
import { cn } from '~/lib/utils'
import { Button } from './ui/button'
import {
  DROPDOWN_COLUMN,
  DROPDOWN_PANEL,
  DropdownColumn,
  DropdownHeading,
  DropdownMeta,
  DropdownNotice,
  DropdownRow,
  DropdownSearch
} from './ui/dropdown'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export function FacetFilter({ className }: { className?: string }) {
  const brands = useAtomValue(activeSlugsAtom)
  const search = useAtomValue(searchAtom)
  const [selected, setSelected] = useAtom(facetsAtom)
  const count = useAtomValue(facetCountAtom)
  const { facets, loading } = useFacets()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  // The server recomputes counts on every selection and drops values that fall
  // to zero, so reading the menu straight off the response makes columns grow,
  // shrink and reorder underneath the cursor as you click. The *shape* of the
  // menu belongs to the catalogs, so it's pinned to the brands (and the global
  // search, the other thing that changes the pool) and only rebuilt when that
  // signature changes. Counts still update live on top.
  const signature = `${[...brands].sort().join(',')}|${search}`

  // Adjust-state-during-render, not a ref: a render-phase ref write is thrown
  // away by StrictMode's double invoke, which left the menu empty on a cold
  // load. React re-runs the component with the new state before painting.
  const [layout, setLayout] = useState<{ key: string; groups: Facet[] }>({
    key: '',
    groups: []
  })

  if (facets.length && layout.key !== signature) {
    setLayout({ key: signature, groups: facets })
  }

  const pinned = layout.key === signature ? layout.groups : facets

  /** Live counts, keyed so the pinned layout can look them up. */
  const counts = useMemo(
    () =>
      new Map(
        facets.flatMap(f => f.values.map(v => [`${f.key}\u0000${v.value}`, v.count]))
      ),
    [facets]
  )

  const toggle = (key: string, value: string) =>
    setSelected(s => {
      const on = s[key] ?? []

      return {
        ...s,
        [key]: on.includes(value) ? on.filter(v => v !== value) : [...on, value]
      }
    })

  const term = query.trim().toLowerCase()

  // Typing is an explicit narrowing, so it may reshape the columns — clicking
  // a value never does.
  const groups = useMemo(
    () =>
      pinned
        .map(f => ({
          ...f,
          values: term
            ? f.values.filter(v => v.value.toLowerCase().includes(term))
            : f.values
        }))
        .filter(f => f.values.length),
    [pinned, term]
  )

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
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        className={cn(DROPDOWN_PANEL, 'max-w-[min(92vw,56rem)]')}
        sideOffset={6}>
        <div className="flex flex-col">
          <DropdownSearch
            icon={Search}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search filters…"
            value={query}
          />

          {loading && !pinned.length ? (
            <DropdownNotice busy>Reading catalogs…</DropdownNotice>
          ) : !groups.length ? (
            <DropdownNotice>
              {pinned.length
                ? 'No filters match your search.'
                : 'No filters for these brands.'}
            </DropdownNotice>
          ) : (
            <div className="flex overflow-x-auto">
              {groups.map(f => (
                <div className={DROPDOWN_COLUMN} key={f.key}>
                  <DropdownHeading>{f.label}</DropdownHeading>
                  <DropdownColumn>
                    {f.values.map(v => {
                      const on = selected[f.key]?.includes(v.value) ?? false
                      const n = counts.get(`${f.key}\u0000${v.value}`) ?? 0

                      return (
                        <DropdownRow
                          active={on}
                          // A value the selection has emptied stays put rather
                          // than vanishing — dimmed but still clickable, so the
                          // column never jumps under the cursor.
                          dim={!n}
                          key={v.value}
                          onClick={() => toggle(f.key, v.value)}>
                          <span className="flex-1 truncate">{v.value}</span>
                          <DropdownMeta active={on}>{n}</DropdownMeta>
                        </DropdownRow>
                      )
                    })}
                  </DropdownColumn>
                </div>
              ))}
            </div>
          )}

          {/* Always rendered so committing a filter doesn't grow the panel. */}
          <div className="flex h-8 items-center justify-between gap-4 px-2.5">
            <DropdownMeta>
              {count ? `${count} ${count === 1 ? 'filter' : 'filters'} on` : 'No filters'}
            </DropdownMeta>
            <Button
              className="h-6 cursor-pointer px-2"
              disabled={!count}
              onClick={() => setSelected({})}
              size="sm"
              variant="ghost">
              <X className="size-3.5" />
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default FacetFilter
