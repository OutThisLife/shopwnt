import * as React from 'react'
import { createPortal } from 'react-dom'
import { BrandContext } from '~/ctx'
import { Button } from '..'
import StyledForm from './style'

function Inner({ visible = false, ...props }: FormProps) {
  const ctx = React.useContext(BrandContext)
  const slugs = [...ctx.slugs.entries()]
  const active = slugs.map<string>(([k, v]) => (v ? k : '')).filter(v => v)

  return (
    <StyledForm className={visible ? 'visible' : ''} id="form" {...props}>
      <div className="tags">
        {active.map(k => (
          <Button key={k} as="span">
            <span dangerouslySetInnerHTML={{ __html: k }} />
            <svg
              fill="currentColor"
              focusable="false"
              height="1em"
              onClick={() =>
                ctx.setState(s => ({
                  ...s,
                  slugs: s.slugs.set(k, false)
                }))
              }
              viewBox="64 64 896 896"
              width="1em">
              <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" />
            </svg>
          </Button>
        ))}

        <Button
          as="input"
          list="slugs"
          onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
            const el = e.target as HTMLInputElement
            const v = el.value

            if (v && ctx.slugs.has(v)) {
              ctx.setState(s => ({
                ...s,
                slugs: s.slugs.set(v, true)
              }))

              el.value = ''
              el.blur()
            }
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            const el = e.target as HTMLInputElement
            const k = e.key
            const v = el.value

            if (k === 'Enter' && v) {
              ctx.setState(s => ({
                ...s,
                slugs: s.slugs.set(v, !s.slugs.has(k))
              }))

              el.value = ''
              el.blur()
            }
          }}
          placeholder={active.length ? 'Add Store' : 'Stores to watch'}
          type="text"
        />

        <datalist id="slugs">
          {slugs.map(([k]) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </datalist>
      </div>

      <div className="sort">
        <Button
          as="select"
          defaultValue={ctx.sortBy ?? ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            ctx.setState(s => ({ ...s, sortBy: e.target.value }))
          }>
          <option value="">Sort By</option>

          {['price', 'updated_at', 'created_at', 'published_at'].map(i => (
            <option key={i} value={i}>
              {`${i}`
                .toLocaleLowerCase()
                .replace(/_|-/g, ' ')
                .split(' ')
                .shift()}
            </option>
          ))}
        </Button>
      </div>
    </StyledForm>
  )
}

export function Form() {
  const [visible, set] = React.useState(() => false)
  const toggle = () => set(st => !st)

  return (
    <>
      <Button
        onPointerDown={toggle}
        style={{
          inset: 'calc(var(--pad) / 2) calc(var(--pad) / 2) auto auto',
          position: 'fixed',
          zIndex: 1e3 + 1
        }}>
        <svg
          fill="currentColor"
          focusable="false"
          height="1em"
          viewBox="64 64 896 896"
          width="1em">
          <path d="M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0 624H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0-312H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z" />
        </svg>
      </Button>

      {createPortal(<Inner {...{ visible }} />, document.body)}
    </>
  )
}

export interface FormProps {
  visible?: boolean
}

export default Form
