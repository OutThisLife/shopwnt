import type { MutableRefObject } from 'react'
import { useEffect, useRef, useState } from 'react'

export const useVisibility = (
  args?: IntersectionObserverInit
): [MutableRefObject<HTMLElement | null>, boolean] => {
  const ref = useRef<HTMLElement>(null)
  const [st, set] = useState<boolean>(() => false)

  const io = useRef<IntersectionObserver | undefined>(
    (() => {
      if ('browser' in process) {
        const o: IntersectionObserver = new IntersectionObserver(
          ([{ isIntersecting: v }]) => (v ? (set(v), o.disconnect()) : null),
          { rootMargin: '0px', threshold: 0.1, ...args }
        )

        return o
      }

      return undefined
    })()
  ).current

  useEffect(() => {
    if (io instanceof IntersectionObserver) {
      if (ref.current instanceof HTMLElement) {
        io?.observe(ref.current)
      } else {
        io?.disconnect()
      }

      return () => {
        io?.disconnect()
      }
    }

    return () => null
  }, [])

  return [ref, st]
}
