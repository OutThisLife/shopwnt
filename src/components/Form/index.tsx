import * as React from 'react'
import StyledForm from './style'

const Option = React.lazy(() => import('./Option'))
const Sort = React.lazy(() => import('./Sort'))
const Tag = React.lazy(() => import('./Tag'))

export const Form: React.FC<React.FormHTMLAttributes<HTMLFormElement>> =
  props => {
    const [$open, setState] = React.useState<boolean>(() => false)

    const toggle = (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault()
      setState(st => !st)
    }

    const refresh = () => navigator.serviceWorker.controller?.postMessage('all')

    return (
      <StyledForm action="#!" data-open={$open} method="post" {...props}>
        <fieldset>
          <Option for="slugs" />

          <div>
            <Sort
              for="sortBy"
              options={[
                'price',
                'updated_at',
                'created_at',
                'published_at',
                'id',
                'title'
              ]}
            />

            <Tag $invert label="⟳" onClick={refresh} />
          </div>

          <a href="#/" onClick={toggle}>
            <span>
              <span />
              <span />
              <span />
            </span>
          </a>
        </fieldset>
      </StyledForm>
    )
  }

export default Form
