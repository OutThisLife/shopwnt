import { QueryClient } from '@tanstack/react-query'

export const client = new QueryClient()

export const log = (...args: any[]) => {
  if (!('browser' in process)) {
    console.log(args)
  } else {
    if (!document.getElementById('log')) {
      const div = document.createElement('div')
      div.id = 'log'

      document.body.appendChild(div)
    }

    const el = document.getElementById('log')

    if (el instanceof HTMLElement) {
      el.innerHTML = args.join('<br />')
    }
  }
}

export * from './atoms'
export { default as storage } from './storage'
export * from './util'
