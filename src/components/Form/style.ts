import { Grid, styled, Text } from '@nextui-org/react'

export const StyledRadioGrid = styled(Grid, {
  '&:not(:hover) svg': { opacity: 0 },
  '> [data-state="checked"] + p': { color: '$primary' },
  '> label': { order: 1 },
  '> p': { order: 0 },
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  placeContent: 'center',
  placeItems: 'center'
} as any)

export const StyledLabel = styled(Text, {
  '> svg': {
    boxSizing: 'content-box',
    cursor: 'pointer',
    height: 'auto',
    p: 10,
    position: 'absolute',
    right: 'calc(-10px - 1.5em)',
    top: 'calc(-10px + .05em)',
    transition: '.3s ease',
    width: '1.5em'
  },
  m: '0 auto .5em',
  position: 'relative',
  width: 'max-content'
} as any)
