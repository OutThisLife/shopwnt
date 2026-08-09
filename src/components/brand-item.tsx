'use client'

import { Check } from 'lucide-react'
import { useBrand } from '~/lib/use-brand'
import { cn } from '~/lib/utils'
import { CommandItem } from './ui/command'
import { Loader } from './ui/loader'

export function BrandItem({ slug }: { slug: string }) {
  const { active, name, pending, resolving, toggle } = useBrand(slug)

  return (
    <CommandItem onSelect={toggle} value={`${name} ${slug}`}>
      <span className={cn('flex-1 transition-opacity', resolving && 'opacity-60')}>
        {name}
      </span>

      {pending ? (
        <Loader className="opacity-60" />
      ) : (
        <Check
          className={cn(
            'text-primary transition-opacity',
            active ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </CommandItem>
  )
}

export default BrandItem
