'use client'

import {
  ActionIcon,
  Drawer,
  Group,
  MultiSelect,
  Select,
  useMantineColorScheme
} from '@mantine/core'
import { showNotification, updateNotification } from '@mantine/notifications'
import {
  IconAdjustments,
  IconArrowsSort,
  IconCheck,
  IconGenderFemale,
  IconMoon,
  IconSun
} from '@tabler/icons'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { slugsAtom, sortAtom } from '~/lib'

export default function Form() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  const [opened, toggle] = useState<boolean>(() => false)
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
        lockScroll={false}
        onClose={() => toggle(false)}
        padding="xl"
        position="right"
        shadow="lg"
        sx={{ '.mantine-Drawer-header button': { display: 'none' } }}
        withOverlay={false}
        {...{ opened }}>
        <MultiSelect
          creatable
          data={Object.keys(slugs)}
          dropdownPosition="flip"
          getCreateLabel={k => `+ Create ${k}`}
          icon={<IconGenderFemale size={16} />}
          label="Brands"
          limit={5}
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
                showNotification({
                  color: 'blue',
                  id: 'add-brand',
                  loading: true,
                  message: 'Verifying shopify domain',
                  title: 'Adding Brand'
                })

                const { slug: k } = await (
                  await fetch(`/api/verify?u=${v}`)
                ).json()

                updateNotification({
                  autoClose: 2e3,
                  color: 'green',
                  icon: <IconCheck size={16} />,
                  id: 'add-brand',
                  message: 'Brand added!',
                  title: 'Done!'
                })

                updateSlugs(s => ({ ...s, [k]: true }))
              } catch (e) {
                updateNotification({
                  autoClose: 2e3,
                  color: 'red',
                  id: 'add-brand',
                  message: 'Not a shopify store, sorry!',
                  title: 'Failed to find store'
                })
              }
            })()

            return v
          }}
          placeholder="List of shopify brands"
          searchable
          transition="pop-top-left"
          transitionDuration={150}
          transitionTimingFunction="ease"
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
          icon={<IconArrowsSort size={16} />}
          label="Sort By"
          onChange={e => e && (updateSort(e), toggle(false))}
          transition="pop-top-left"
          transitionDuration={150}
          transitionTimingFunction="ease"
          value={sortBy}
        />
      </Drawer>
    </>
  )
}
