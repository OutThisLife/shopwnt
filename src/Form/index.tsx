import * as React from 'react'
import type { Brand } from '../../types'
import StyledForm from './style'

export const Form: React.FC<FormProps> = React.forwardRef<
  HTMLFormElement,
  FormProps
>(function _({ setBrand, slug, test, ...props }, ref) {
  const onSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      alert('submitted')
      e.preventDefault()

      setBrand({
        slug: e.currentTarget?.brand?.value,
        test: e.currentTarget?.size?.value
      })
    },
    [setBrand]
  )

  return (
    <StyledForm action="#!" method="post" {...{ onSubmit, ref, ...props }}>
      <fieldset>
        <label htmlFor="brand">
          brand:{' '}
          <input
            autoComplete="off"
            defaultValue={slug}
            id="brand"
            name="brand"
            placeholder="brand name"
            spellCheck={false}
            type="text"
          />
        </label>

        <label htmlFor="sizes">
          sizes:{' '}
          <input
            autoComplete="off"
            defaultValue={`${test}`}
            id="size"
            name="size"
            placeholder="sizes"
            spellCheck={false}
            type="text"
          />
        </label>

        <button type="submit">submit</button>
      </fieldset>
    </StyledForm>
  )
})

export interface FormProps extends Brand {
  setBrand(k: Brand): void
}
