'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '~/lib/utils'

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'dark', label: 'Dark', Icon: Moon }
] as const

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const wrapper = cn(
    'inline-flex items-center gap-0.5 rounded-full border bg-muted/60 p-0.5',
    className
  )

  // Avoid a hydration mismatch: the resolved theme is only known on the client.
  if (!mounted) {
    return <div aria-hidden className={cn(wrapper, 'h-8 w-[5.75rem]')} />
  }

  return (
    <div className={wrapper} role="radiogroup">
      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = theme === value

        return (
          <button
            aria-checked={isActive}
            aria-label={label}
            className={cn(
              'relative inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors',
              'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
              isActive && 'bg-background text-foreground shadow-sm'
            )}
            key={value}
            onClick={() => setTheme(value)}
            role="radio"
            type="button">
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}

export default ModeToggle
