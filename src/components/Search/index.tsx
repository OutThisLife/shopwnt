import * as React from 'react'
import { createPortal } from 'react-dom'
import { BrandContext } from '~/ctx'
import { Button } from '..'
import StyledForm from './style'

function Inner() {
  const ctx = React.useContext(BrandContext)
  const ref = React.useRef<HTMLFormElement>(null)
  const tm = React.useRef<NodeJS.Timeout>()

  const onChange = () => {
    clearTimeout(tm.current as NodeJS.Timeout)

    tm.current = setTimeout(
      () =>
        ctx.setState(s => ({
          ...s,
          search: (ref.current?.firstElementChild as HTMLInputElement)?.value
        })),
      500
    )
  }

  return (
    <StyledForm {...{ onChange, ref }}>
      <Button
        as="input"
        autoFocus
        placeholder="Start typing&hellip;"
        type="text"
      />
    </StyledForm>
  )
}

export function Search() {
  const [open, set] = React.useState<boolean>(() => false)

  React.useEffect(() => {
    const handle = (e: KeyboardEvent) => set(() => !/escape|enter/i.test(e.key))

    document.body.addEventListener('keydown', handle)

    return () => {
      document.body.removeEventListener('keydown', handle)
    }
  }, [])

  return open && createPortal(<Inner />, document.body)
}

Search.displayName = 'Search'

export default Search
