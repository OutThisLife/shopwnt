import * as React from 'react'
import StyledForm from './style'

const defaultSize = /x?s|petite|00|o\/?s/i
const defaultTest = `${defaultSize}`.slice(1, -2)

export const Form: React.FC<FormProps> = ({ children, ...props }) => (
  <StyledForm {...props}>
    <fieldset>
      {children}

      <input
        autoComplete="off"
        id="brand"
        name="brand"
        placeholder="brand name"
        spellCheck={false}
        type="text"
      />

      <input
        autoComplete="off"
        defaultValue={defaultTest}
        id="size"
        name="size"
        placeholder="sizes"
        spellCheck={false}
        type="text"
      />
    </fieldset>
  </StyledForm>
)

export interface FormProps {
  bob?: any
}
