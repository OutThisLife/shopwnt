import * as React from 'react'

export function WindowScroller({ children }: WindowProps) {
  const ref = React.useRef<HTMLElement>()
  const outerRef = React.useRef<HTMLElement>()

  React.useEffect(() => {
    if (!('browser' in process)) {
      return () => void null
    }

    const onSCroll = () =>
      ref.current?.scrollTo(
        (window.scrollY - (outerRef.current?.offsetTop ?? 0)) as ScrollOptions
      )

    const c = new AbortController()

    window.addEventListener('scroll', onSCroll, { signal: c.signal })

    return () => c.abort()
  }, [])

  return children({
    outerRef,
    ref,
    style: {
      height: '100%',
      minHeight: 'calc(100vh - (var(--pad) * 2))',
      minWidth: 'calc(100vw - (var(--pad) * 2))',
      width: '100%'
    }
  })
}

export interface WindowProps {
  children(props: Record<string, any>): React.ReactElement
}

export default WindowScroller
