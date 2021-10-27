import styled from 'styled-components'
import { Card } from '~/components/antd'

export default styled(Card)`
  content-visibility: auto;
  user-select: none;

  .ant-card-head-title > a {
    color: currentColor;
  }

  .ant-card-body {
    display: grid;
    grid-auto-columns: max-content;
    grid-auto-flow: column dense;
    max-width: 100%;
    overflow: overlay;
    width: 100%;

    &:before,
    &:after {
      content: none;
    }

    ::-webkit-scrollbar {
      height: 2px;
      width: 2px;
    }

    > * {
      flex: auto 0 0;
    }

    .ant-card-loading-content {
      flex: 100% 0 0;
    }
  }
`
