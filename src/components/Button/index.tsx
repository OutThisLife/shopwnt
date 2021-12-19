import styled, { css } from 'styled-components'

export const Button = styled.button.attrs<ButtonProps>(p => ({
  type: p.type ?? (p.as === 'button' ? p.as : undefined)
}))<ButtonProps>`
  background: var(--bg);
  border: 1px solid hsl(0, 0%, 85%);
  border-radius: 2px;
  box-shadow: 0 2px 0 rgb(0 0 0 / 2%);
  color: var(--fg);
  font-size: 1rem;
  line-height: 1.5715;
  outline: none !important;
  padding: 0.5rem 1rem;
  touch-action: manipulation;
  transition: 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
  user-select: none;

  &:hover,
  &:focus {
    border-color: currentColor;
    color: var(--accent);

    &::placeholder {
      color: inherit;
    }
  }

  ${p =>
    /button/i.test(`${p.as ?? 'button'}`)
      ? css`
          cursor: pointer;
        `
      : css`
          @media (max-width: 1024px) {
            font-size: 16px;
          }
        `}
`

export interface ButtonProps {
  as?: string
}

export default Button
