'use client'

import { Check, Loader2 } from 'lucide-react'
import { cn } from '~/lib/utils'
import { CommandItem } from './ui/command'

export function BrandItem({
  slug,
  active,
  pending,
  onToggle
}: {
  slug: string
  active: boolean
  pending: boolean
  onToggle: () => void
}) {
  return (
    <CommandItem onSelect={onToggle} value={slug}>
      <span className="glass-adaptive-text flex-1 truncate">{slug}</span>

      {pending && <Loader2 className="size-3.5 animate-spin opacity-13" />}

      <Check className={cn('text-primary', active ? 'opacity-100' : 'opacity-0')} />
    </CommandItem>
  )
}

export default BrandItem
