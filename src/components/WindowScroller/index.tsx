import type { ReactElement } from 'react'
import { useEffect, useRef } from 'react'

export function WindowScroller({ children }: WindowProps) {
  const ref = useRef<HTMLElement>()
  const outerRef = useRef<HTMLElement>()

  useEffect(() => {
    if (!('browser' in process)) {
      return () => void null
    }

    const ac = new AbortController()
    const { signal } = ac

    const onSCroll = () =>
      ref.current?.scrollTo(
        (window.scrollY - (outerRef.current?.offsetTop ?? 0)) as ScrollOptions
      )

    window.addEventListener('scroll', onSCroll, { signal })

    return () => ac?.abort()
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
  children(props: Record<string, any>): ReactElement
}

export default WindowScroller
