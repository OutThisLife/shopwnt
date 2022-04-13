import { Button, Card, Grid, Radio, Switch, Text } from '@nextui-org/react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { BrandContext } from '~/ctx'

function Inner(props: FormProps) {
  const ctx = React.useContext(BrandContext)
  const slugs = [...ctx.slugs.entries()]

  return (
    <Card css={{ inset: 'auto 0 0', position: 'fixed' }} shadow {...props}>
      <Card.Header>
        <Radio.Group
          css={{ textAlign: 'center', w: '100%' }}
          initialValue={ctx?.sortBy}
          onChange={e => ctx.setState(s => ({ ...s, sortBy: `${e}` }))}
          row
          size="xs">
          {['price', 'updated_at', 'created_at', 'published_at'].map(i => (
            <Radio key={i} size="xs" value={i}>
              <Text size={10} transform="uppercase" weight="semibold">
                {`${i}`
                  .toLocaleLowerCase()
                  .replace(/_|-/g, ' ')
                  .split(' ')
                  .shift()}
              </Text>
            </Radio>
          ))}
        </Radio.Group>
      </Card.Header>

      <Card.Body>
        <Grid.Container css={{ w: '90%' }} gap={1} justify="center">
          {slugs.map(([k, v]) => (
            <Grid
              alignContent="center"
              alignItems="center"
              css={{ textAlign: 'center' }}>
              <Text
                color={v ? 'primary' : 'default'}
                size={10}
                transform="uppercase"
                weight="semibold">
                {k}
              </Text>

              <Switch
                key={k}
                initialChecked={!!v}
                onChange={({ target: { checked: e } }) =>
                  setTimeout(
                    () =>
                      ctx.setState(s => ({
                        ...s,
                        slugs: s.slugs.set(k, e)
                      })),
                    500
                  )
                }
                shadow
              />
            </Grid>
          ))}
        </Grid.Container>
      </Card.Body>
    </Card>
  )
}

export function Form() {
  const [visible, set] = React.useState(() => false)
  const toggle = () => set(st => !st)

  return (
    <>
      <Button
        auto
        color="gradient"
        css={{
          inset: 'auto 1rem 1rem auto',
          position: 'fixed',
          zIndex: 1e3 + 1
        }}
        icon={
          <svg
            fill="currentColor"
            focusable="false"
            height="1rem"
            viewBox="64 64 896 896"
            width="1rem">
            <path d="M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0 624H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0-312H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z" />
          </svg>
        }
        onPointerDown={toggle}
        shadow
      />

      {visible && createPortal(<Inner />, document.body)}
    </>
  )
}

export interface FormProps {
  visible?: boolean
}

export default Form
