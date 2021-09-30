import styled, { css } from 'styled-components'
import type { TagProps } from '.'

export default styled.span<TagProps>`
  border-radius: 3px;
  cursor: pointer;
  display: inline-flex;
  gap: 1ex;
  line-height: 0;
  padding: 0.9em 0.7em;
  place-content: center;
  text-transform: lowercase;
  vertical-align: text-top;
  white-space: nowrap;

  ${p =>
    p.$invert
      ? css`
          background: var(--primary);
          color: var(--bg);

          a {
            display: none;
          }
        `
      : css`
          --bl: 1.3;
          --fl: 1.2;

          ${p.$active &&
          css`
            --active: 1;
          `}

          background: hsla(var(--primary-bg), 0.1);
          background: hsla(var(--primary-bg), calc(var(--active, 0) * 0.05));
          box-shadow: inset 0 0 0 1px hsla(var(--primary-bg), 0.2);
          color: hsla(var(--primary-fg), 1);
        `}

  a {
    color: inherit;
    text-decoration: none;
  }
`
