import * as React from 'react'
import StyledForm from './style'

export const Form: React.FC<React.FormHTMLAttributes<HTMLFormElement>> =
  React.forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement>>(
    function _(props, ref) {
      return <StyledForm action="#!" method="post" {...{ ref, ...props }} />
    }
  )

export default Form

export * from './Input'
export * from './Tag'
