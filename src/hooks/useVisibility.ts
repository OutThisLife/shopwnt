import type { MutableRefObject } from 'react'
import { useEffect, useRef, useState } from 'react'

export const useVisibility = (
  args?: IntersectionObserverInit
): [MutableRefObject<HTMLElement | null>, boolean] => {
  const ref = useRef<HTMLElement>(null)
  const [st, set] = useState<boolean>(() => false)

  const io: IntersectionObserver = useRef<IntersectionObserver>(
    new IntersectionObserver(
      ([{ isIntersecting: v }]) => (v ? (set(v), io.disconnect()) : null),
      { rootMargin: '0px', threshold: 0.1, ...args }
    )
  ).current

  useEffect(() => {
    if (ref.current instanceof HTMLElement) {
      io.observe(ref.current)
    } else {
      io?.disconnect()
    }

    return () => {
      io?.disconnect()
    }
  }, [])

  return [ref, st]
}

export default useVisibility
