import * as React from 'react'
import StyledTag from './style'

export const Tag: React.FC<TagProps> = ({ label, onDelete, ...props }) => (
  <StyledTag {...props}>
    {label}{' '}
    <a href="#/" onClick={onDelete}>
      ✘
    </a>
  </StyledTag>
)

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  $invert?: boolean
  $active?: boolean
  label?: string
  onDelete?: TagProps['onClick']
}

export default Tag
