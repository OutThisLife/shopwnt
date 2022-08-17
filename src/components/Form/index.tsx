import {
  ActionIcon,
  Drawer,
  Group,
  LoadingOverlay,
  MultiSelect,
  Select,
  useMantineColorScheme
} from '@mantine/core'
import { IconAdjustments, IconMoon, IconSun } from '@tabler/icons'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { slugsAtom, sortAtom } from '~/lib'

export default function Form() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  const [opened, toggle] = useState<boolean>(() => false)
  const [loading, setLoading] = useState<boolean>(() => false)

  const [sortBy, updateSort] = useAtom(sortAtom)
  const [slugs, updateSlugs] = useAtom(slugsAtom)

  return (
    <>
      <Group
        spacing="xs"
        sx={{
          inset: '1rem 1rem auto auto',
          position: 'fixed',
          zIndex: 1e3 + 1
        }}>
        <ActionIcon
          onClick={() => toggle(s => !s)}
          radius="lg"
          size="lg"
          variant="default">
          <IconAdjustments />
        </ActionIcon>

        <ActionIcon
          onClick={() => toggleColorScheme()}
          radius="lg"
          size="lg"
          variant="default">
          {colorScheme === 'light' ? <IconMoon /> : <IconSun />}
        </ActionIcon>
      </Group>

      <Drawer
        onClose={() => toggle(false)}
        overlayBlur={3}
        overlayOpacity={0.55}
        padding="xl"
        position="top"
        size="sm"
        title="Settings"
        {...{ opened }}>
        <LoadingOverlay visible={loading} />

        <MultiSelect
          creatable
          data={Object.keys(slugs)}
          dropdownPosition="flip"
          getCreateLabel={k => `+ Create ${k}`}
          label="Brands"
          mb="md"
          onChange={e =>
            updateSlugs(s =>
              Object.keys(s).reduce(
                (acc, k) => ({
                  ...acc,
                  [k]: e.includes(k)
                }),
                {}
              )
            )
          }
          onCreate={v => {
            ;(async () => {
              try {
                setLoading(true)

                const { slug: k } = await (
                  await fetch(`/api/verify?u=${v}`)
                ).json()

                updateSlugs(s => ({ ...s, [k]: true }))
              } catch (e) {
                console.warn(e)
              } finally {
                setLoading(false)
              }
            })()

            return v
          }}
          placeholder="Choose Brands to Monitor"
          searchable
          value={Object.entries(slugs)
            .filter(([, v]) => v)
            .map(([k]) => k)}
        />

        <Select
          data={['price', 'updated_at', 'created_at', 'published_at'].map(
            k => ({
              label: k
                .toLocaleLowerCase()
                .replace(/_|-/g, ' ')
                .split(' ')
                .shift(),
              value: k
            })
          )}
          dropdownPosition="flip"
          label="Sort By"
          onChange={e => e && (updateSort(e), toggle(false))}
          value={sortBy}
        />
      </Drawer>
    </>
  )
}
