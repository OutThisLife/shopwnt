/* eslint-disable no-alert */
import type { SwitchEvent } from '@nextui-org/react'
import { Button, Card, Grid, Loading, Radio, Switch } from '@nextui-org/react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { BrandContext } from '~/ctx'
import { useStorage } from '~/hooks'
import { confirm, prompt } from '~/lib'
import { StyledLabel, StyledRadioGrid } from './style'

function Inner(props: FormProps) {
  const [loading, setLoading] = React.useState(() => false)
  const ctx = React.useContext(BrandContext)
  const slugs = [...ctx.slugs.entries()]

  const handleAdd = React.useCallback(async () => {
    try {
      const vendor = await prompt('Enter a store URL')

      setLoading(true)

      const { slug: k } = await (await fetch(`/api/verify?u=${vendor}`)).json()
      ctx.setState(s => ({ ...s, slugs: s.slugs.set(k, true), ts: Date.now() }))
    } catch (err) {
      if (err) {
        alert('Store not found')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleVendor = React.useCallback(
    (k: string) =>
      ({ target: { checked: v } }: SwitchEvent) => {
        setTimeout(
          () =>
            ctx.setState(s => ({
              ...s,
              slugs: s.slugs.set(k, v),
              ts: Date.now()
            })),
          200
        )
      },
    []
  )

  const handleDelete = React.useCallback(
    (k: string) => async () => {
      try {
        await confirm(`Do you want to delete "${k}"?`)

        ctx.setState(s => {
          s.slugs.delete(k)

          return { ...s, ts: Date.now() }
        })
      } catch (_) {}
    },
    []
  )

  const handleSort = React.useCallback(
    (e: string | number) =>
      ctx.setState(s => ({ ...s, sortBy: `${e}`, ts: Date.now() })),
    []
  )

  return (
    <Card
      css={{ inset: 'auto 0 0', pb: 20, position: 'fixed' }}
      shadow
      {...props}>
      <Card.Body css={{ textAlign: 'center' }}>
        <Grid.Container alignItems="center" gap={2} justify="center">
          <Grid>
            <Button
              auto
              css={{ w: 100 }}
              disabled={loading}
              onPointerDown={handleAdd}>
              {!loading ? (
                <StyledLabel size={11}>Add New</StyledLabel>
              ) : (
                <Loading color="currentColor" size="sm" />
              )}
            </Button>
          </Grid>

          <React.Fragment key={ctx.ts}>
            {slugs.map(([k, v]) => (
              <StyledRadioGrid key={k}>
                <Switch
                  initialChecked={!!v}
                  onChange={toggleVendor(k)}
                  shadow
                />

                <StyledLabel>
                  <svg
                    fill="#ffffff"
                    onClick={handleDelete(k)}
                    viewBox="0 0 24 24"
                    width={12}
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5.72 5.72a.75.75 0 0 1 1.06 0L12 10.94l5.22-5.22a.75.75 0 1 1 1.06 1.06L13.06 12l5.22 5.22a.75.75 0 1 1-1.06 1.06L12 13.06l-5.22 5.22a.75.75 0 0 1-1.06-1.06L10.94 12 5.72 6.78a.75.75 0 0 1 0-1.06z"
                      fillRule="evenodd"
                    />
                  </svg>

                  <span>{k}</span>
                </StyledLabel>
              </StyledRadioGrid>
            ))}
          </React.Fragment>
        </Grid.Container>
      </Card.Body>

      <Card.Footer>
        <Radio.Group
          css={{ gap: 10, placeContent: 'center', w: '100%' }}
          initialValue={ctx?.sortBy}
          onChange={handleSort}
          row
          size="xs">
          {['price', 'updated_at', 'created_at', 'published_at'].map(i => (
            <Radio key={i} size="xs" value={i}>
              <StyledLabel>
                {`${i}`
                  .toLocaleLowerCase()
                  .replace(/_|-/g, ' ')
                  .split(' ')
                  .shift()}
              </StyledLabel>
            </Radio>
          ))}
        </Radio.Group>
      </Card.Footer>
    </Card>
  )
}

export function Form() {
  const [visible, set] = useStorage<boolean>('form-visible', () => false)
  const onPointerDown = React.useCallback(() => set(st => !st), [])

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
        shadow
        {...{ onPointerDown }}
      />

      {'browser' in process &&
        visible &&
        createPortal(<Inner />, document.body)}
    </>
  )
}

export interface FormProps {
  visible?: boolean
}

export default Form
