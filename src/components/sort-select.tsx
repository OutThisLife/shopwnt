'use client'

import { useAtom } from 'jotai'
import { ArrowUpDown } from 'lucide-react'
import type { ComponentProps } from 'react'
import { SORT_OPTIONS, type SortId, sortAtom } from '~/lib'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'

export function SortSelect({ className }: { className?: string }) {
  const [sort, setSort] = useAtom(sortAtom)

  return (
    <Select onValueChange={v => setSort(v as SortId)} value={sort}>
      <SelectTrigger
        aria-label="Sort products"
        className={className as ComponentProps<typeof SelectTrigger>['className']}>
        <ArrowUpDown className="opacity-60" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {SORT_OPTIONS.map(o => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default SortSelect
