import * as React from 'react'

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
  const ro = React.useRef<ResizeObserver>(
    new ResizeObserver(([e]) => cb(e.target, e.contentRect))
  ).current

  const io = React.useRef<IntersectionObserver>(
    new IntersectionObserver(([e]) => cb(e.target, e.boundingClientRect))
  ).current

  return React.useCallback(
    (elements?: Element[] | HTMLCollectionOf<Element>) => {
      if (!elements?.length) {
        return () => null
      }

      Array.from(elements).forEach(e => {
        if (e instanceof HTMLElement) {
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
          if (e instanceof HTMLElement) {
            ro.unobserve(e)
            io.unobserve(e)
          }
        })
    },
    []
  )
}

export default useContentVisibility
