import * as React from 'react'

export const Input: React.FC<InputProps> = props => (
  <input
    autoCapitalize="off"
    autoComplete="off"
    spellCheck={false}
    type="text"
    {...props}
  />
)

interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
  name?: string
}
