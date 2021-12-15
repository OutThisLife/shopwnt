import { useCallback, useRef } from 'react'

const spaced = new WeakMap<Element, DOMRect>()

const isEqual = (a: DOMRect, b: DOMRect) =>
  !(Math.abs(a.width - b.width) <= 2 || Math.abs(a.height - b.height) <= 2)

const cb = (el: Element, a = el.getBoundingClientRect()) => {
  const b = spaced.get(el)

  if (!b || !isEqual(a, b)) {
    ;(el as HTMLElement).style.setProperty(
      'contain-intrinsic-size',
      `${a.width}px ${a.height}px`
    )

    spaced.set(el, a)
  }
}

export const useContentVisibility = () => {
  const ro = useRef<ResizeObserver | boolean>(
    'browser' in process &&
      new ResizeObserver(([e]) => cb(e.target, e.contentRect))
  ).current

  const io = useRef<IntersectionObserver | boolean>(
    'browser' in process &&
      new IntersectionObserver(([e]) => cb(e.target, e.boundingClientRect))
  ).current

  return useCallback((elements?: Element[] | HTMLCollectionOf<Element>) => {
    if (!elements?.length) {
      return () => void null
    }

    Array.from(elements).forEach(e => {
      if (
        e instanceof HTMLElement &&
        ro instanceof ResizeObserver &&
        io instanceof IntersectionObserver
      ) {
        cb(e)

        ro.unobserve(e)
        io.unobserve(e)

        ro.observe(e)
        io.observe(e)

        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() =>
            e.style.setProperty('content-visibility', 'auto')
          )
        )
      }
    })

    return () =>
      Array.from(elements).forEach(e => {
        if (
          e instanceof HTMLElement &&
          ro instanceof ResizeObserver &&
          io instanceof IntersectionObserver
        ) {
          ro.unobserve(e)
          io.unobserve(e)
        }
      })
  }, [])
}
