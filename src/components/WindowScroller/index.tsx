import * as React from 'react'

export default function ReactWindowScroller({ children }: WindowProps) {
  const ref = React.useRef<HTMLElement>()
  const outerRef = React.useRef<HTMLElement>()

  const onScroll = React.useCallback(
    ({ scrollOffset, scrollUpdateWasRequested }) => {
      if (!scrollUpdateWasRequested) {
        return
      }

      const top = window.pageYOffset

      scrollOffset += Math.min(top, outerRef.current?.offsetTop ?? 0)

      if (scrollOffset !== top) {
        window.scrollTo(0, scrollOffset)
      }
    },
    []
  )

  React.useEffect(() => {
    const onSCroll = () =>
      window.requestAnimationFrame(() =>
        ref.current?.scrollTo(
          (window.scrollY - (outerRef.current?.offsetTop ?? 0)) as any
        )
      )

    window.addEventListener('scroll', onSCroll)

    return () => window.removeEventListener('scroll', onSCroll)
  }, [])

  return children({
    onScroll,
    outerRef,
    ref,
    style: {
      display: 'inline-block',
      height: '100%',
      width: '100%'
    }
  })
}

export interface WindowProps {
  children(props: Record<string, any>): React.ReactElement
}
