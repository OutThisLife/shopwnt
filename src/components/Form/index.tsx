import { MenuOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Drawer, Select, Space, Tag, Typography } from 'antd'
import * as React from 'react'
import { BrandContext } from '~/ctx'

export const Form: React.FC<{
  visible: boolean
  toggle(e: unknown): void
}> = ({ toggle, visible }) => {
  const ctx = React.useContext(BrandContext)
  const slugs = [...ctx.slugs.entries()]

  return (
    <Drawer
      closeIcon={<MenuOutlined />}
      destroyOnClose
      footer={
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <Typography.Text>Sort by:</Typography.Text>

            <Select
              key="sort"
              defaultValue={ctx.sortBy}
              id="sort"
              onChange={e => ctx.setState(s => ({ ...s, sortBy: e }))}>
              {['price', 'updated_at', 'created_at', 'published_at'].map(i => (
                <Select.Option key={i} value={i}>
                  {i
                    .toLocaleLowerCase()
                    .replace(/_|-/g, ' ')
                    .split(' ')
                    .shift()}
                </Select.Option>
              ))}
            </Select>
          </Space>

          <Button
            danger
            icon={<ReloadOutlined />}
            onClick={() =>
              navigator.serviceWorker.controller?.postMessage('all')
            }>
            Reset Cache
          </Button>
        </Space>
      }
      height={140}
      mask={false}
      onClose={toggle}
      placement="top"
      style={{
        inset: '0 calc(var(--pad) / 2) auto',
        width: 'auto'
      }}
      {...{ visible }}>
      <Select
        key="brands"
        allowClear
        bordered={false}
        defaultValue={slugs
          .map<string>(([k, v]) => (v ? k : ''))
          .filter(v => v)}
        id="brands"
        mode="tags"
        onChange={r =>
          ctx.setState(s => {
            ;[...s.slugs.keys(), ...r].forEach(k =>
              s.slugs.set(k, r.includes(k))
            )

            return { ...s, slugs: s.slugs }
          })
        }
        placeholder="Stores to watch"
        style={{ width: '95%' }}
        tagRender={({ label, ...props }) => (
          <Tag color="magenta" {...props}>
            {label}
          </Tag>
        )}>
        {slugs.map(([i]) => (
          <Select.Option key={i} value={i}>
            {i}
          </Select.Option>
        ))}
      </Select>
    </Drawer>
  )
}
