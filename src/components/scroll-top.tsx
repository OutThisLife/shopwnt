'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '~/lib/utils'
import { Button } from './ui/button'

export function ScrollTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Button
      aria-hidden={!show}
      aria-label="Back to top"
      className={cn(
        'fixed right-4 bottom-4 z-50 size-10 rounded-full shadow-lg transition-all sm:right-6 sm:bottom-6',
        show
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0'
      )}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      size="icon"
      tabIndex={show ? 0 : -1}
      variant="secondary">
      <ArrowUp className="size-4" />
    </Button>
  )
}

export default ScrollTop
