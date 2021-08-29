/* eslint-disable no-restricted-globals */
;(self => {
  self.addEventListener('activate', e =>
    e.waitUntil(
      caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
    )
  )

  self.addEventListener('fetch', e =>
    e.respondWith(
      (async () => {
        const r = e.request

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
})(self)