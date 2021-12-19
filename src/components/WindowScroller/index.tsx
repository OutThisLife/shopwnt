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

    window.addEventListener('scroll', onSCroll, { passive: false })

    return () => window.removeEventListener('scroll', onSCroll)
  }, [])

  return children({
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

export default WindowScroller
