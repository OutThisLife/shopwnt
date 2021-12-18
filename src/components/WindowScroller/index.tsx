import * as React from 'react'

export function WindowScroller({ children }: WindowProps) {
  const ref = React.useRef<HTMLElement>()
  const outerRef = React.useRef<HTMLElement>()

  const onScroll = React.useCallback(
    ({ scrollOffset, scrollUpdateWasRequested }) => {
      if (!scrollUpdateWasRequested) {
        return
      }

      const top = window.pageYOffset
      const y = scrollOffset + Math.min(top, outerRef.current?.offsetTop ?? 0)

      if (y !== top) {
        window.scrollTo(0, y)
      }
    },
    []
  )

  React.useEffect(() => {
    if (!('browser' in process)) {
      return () => void null
    }

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
      height: 'min(100%, 100vh)',
      width: 'min(100%, 100vw)'
    }
  })
}

export interface WindowProps {
  children(props: Record<string, any>): React.ReactElement
}

export default WindowScroller
