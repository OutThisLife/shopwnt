/* eslint-disable no-restricted-globals */
;((self: ServiceWorkerGlobalScope) => {
  self.addEventListener('activate', e =>
    e.waitUntil(
      caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
    )
  )

  self.addEventListener('fetch', ({ request: r, respondWith }) =>
    respondWith(
      (async () => {
        if (!r.url.includes('json')) {
          return fetch(r.clone())
        }

        const cache = await caches.open('SHOPWNT')
        const res = await cache.match(r.clone())

        if (res) {
          return res
        }

        const xhr = await fetch(r.clone())
        cache.put(r, xhr.clone())

        return xhr
      })()
    )
  )

  self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))
  self.addEventListener('install', e => e.waitUntil(self.skipWaiting()))
})(self as any as ServiceWorkerGlobalScope)
