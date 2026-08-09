'use client'

import { useAtom } from 'jotai'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { getSortOption, SORT_OPTIONS, type SortId, sortAtom } from '~/lib'
import { useHoverOpen } from '~/lib/use-hover-open'
import { cn } from '~/lib/utils'
import { Button } from './ui/button'
import {
  DROPDOWN_PANEL,
  DropdownCheck,
  DropdownColumn,
  DropdownRow
} from './ui/dropdown'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

/**
 * A popover rather than a native select: the toolbar's other two menus open on
 * hover, and Radix's Select can't join them — it blocks pointer events outside
 * itself while open, so the bar would dead-end here.
 */
export function SortSelect({ className }: { className?: string }) {
  const [sort, setSort] = useAtom(sortAtom)
  const [open, setOpen] = useState(false)
  const hover = useHoverOpen(open, setOpen)

  const choose = (value: SortId) => {
    setSort(value)
    setOpen(false)
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild {...hover.trigger}>
        <Button
          aria-label="Sort products"
          className={cn('gap-2', className)}
          variant="ghost">
          <ArrowUpDown className="size-4 opacity-70" />
          <span>{getSortOption(sort).label}</span>
          <ChevronDown className="size-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        className={DROPDOWN_PANEL}
        sideOffset={6}
        {...hover.content}>
        <DropdownColumn className="w-max py-1">
          {SORT_OPTIONS.map(o => (
            <DropdownRow
              active={o.value === sort}
              key={o.value}
              onClick={() => choose(o.value)}>
              <span className="flex-1">{o.label}</span>
              <DropdownCheck active={o.value === sort} />
            </DropdownRow>
          ))}
        </DropdownColumn>
      </PopoverContent>
    </Popover>
  )
}

export default SortSelect
