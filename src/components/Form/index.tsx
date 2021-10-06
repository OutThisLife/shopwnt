import { MenuOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Drawer, Select, Space, Tag, Typography } from 'antd'
import * as React from 'react'
import { BrandContext } from '~/ctx'

export const Form: React.FC<{ visible: boolean; toggle(): void }> = ({
  toggle,
  visible
}) => {
  const ctx = React.useContext(BrandContext)

  return (
    <>
      <Button
        icon={<MenuOutlined />}
        onClick={toggle}
        style={{ inset: '1rem 1rem auto auto', position: 'fixed', zIndex: 1e3 }}
      />

      <Drawer
        closeIcon={<MenuOutlined />}
        footer={
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Space>
              <Typography.Text>Sort by:</Typography.Text>

              <Select
                key="sort"
                defaultValue={ctx.sortBy}
                id="sort"
                onChange={e => ctx.setState(s => ({ ...s, sortBy: e }))}>
                {['price', 'updated_at', 'created_at', 'published_at'].map(
                  i => (
                    <Select.Option key={i} value={i}>
                      {i}
                    </Select.Option>
                  )
                )}
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
        {...{ visible }}>
        <Select
          key="brands"
          bordered={false}
          defaultValue={[
            ...[...ctx.slugs.entries()].map<string>(([k, v]) => (v ? k : ''))
          ].filter(v => v)}
          id="brands"
          mode="tags"
          onChange={r =>
            ctx.setState(s => {
              ;[...s.slugs.keys()].forEach(k => s.slugs.set(k, r.includes(k)))

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
          {[...ctx.slugs.entries()].map(([i]) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </Select>
      </Drawer>
    </>
  )
}

export default Form
