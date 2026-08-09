'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { isTyping } from '~/lib'

/**
 * `x` flips light and dark. Keyed off the resolved theme so the first press
 * lands on the opposite of what's on screen, rather than no-oping out of
 * "system".
 */
export function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'x' || e.metaKey || e.ctrlKey || e.altKey || isTyping()) {
        return
      }

      e.preventDefault()
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [resolvedTheme, setTheme])

  return null
}

export default ThemeHotkey
