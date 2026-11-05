// Heath18 offline support: pages are network-first (fresh when online, cached when offline);
// built assets and fonts are cached as they load.
const CACHE = 'h18-v3'
const SHELL = ['/', '/manifest.webmanifest', '/icon-192.png']

// Cache a page plus the hashed /assets/ files it links, so the app opens offline.
async function cachePage(key, res) {
  const c = await caches.open(CACHE)
  await c.put(key, res.clone())
  const html = await res.text()
  const assets = [...new Set(html.match(/\/assets\/[^"']+/g) || [])]
  await Promise.all(assets.map(a => c.match(a, { ignoreVary: true }).then(hit => hit || c.add(a).catch(() => {}))))
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL.slice(1)))
      .then(() => fetch('/'))
      .then(res => res.ok && cachePage('/', res))
      .then(() => self.skipWaiting())
  )
})
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  const sameOrigin = url.origin === self.location.origin
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)
  if (!sameOrigin && !isFont) return

  if (req.mode === 'navigate') {
    // SPA routes all serve index.html; /burn/ is its own page.
    const key = url.pathname.startsWith('/burn/') ? '/burn/' : '/'
    e.respondWith(
      fetch(req).then(res => { if (res.ok) e.waitUntil(cachePage(key, res.clone())); return res })
        .catch(() => caches.match(key, { ignoreVary: true }).then(r => r || caches.match('/', { ignoreVary: true })))
    )
    return
  }
  e.respondWith(
    caches.match(req, { ignoreVary: true }).then(hit => {
      const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') caches.open(CACHE).then(c => c.put(req, res.clone())); return res })
      return hit || net
    })
  )
})
self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => (cs[0] ? cs[0].focus() : self.clients.openWindow('/'))))
})
