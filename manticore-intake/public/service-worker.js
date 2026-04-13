// Manticore Intake — Service Worker
// Caches the app shell so it loads offline after first visit.

const CACHE_NAME = 'manticore-intake-v1'

// Files to cache on install (Vite hashes these — SW caches whatever it can after first load)
const SHELL_URLS = ['/', '/index.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Only cache GET requests; skip API calls and Netlify functions
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('/.netlify/') || event.request.url.includes('generativelanguage')) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((res) => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone))
        }
        return res
      })
      // Serve cache instantly, update in background (stale-while-revalidate)
      return cached ?? network
    })
  )
})
