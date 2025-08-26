// Service Worker para PWA Fascinar Eventos
const CACHE_NAME = 'fascinar-eventos-v2'

// URLs essenciais para cache
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json'
  // Removendo arquivos específicos do Vite que podem variar
]

// URLs que devem ser sempre buscadas da rede
const NETWORK_FIRST_URLS = [
  '/api/',
  '/auth/',
  '/supabase/',
  'supabase.co'
]

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential files')
        return cache.addAll(STATIC_CACHE_URLS).catch((error) => {
          console.warn('[SW] Cache addAll failed:', error)
          // Não falhar se o cache não funcionar
          return Promise.resolve()
        })
      })
      .then(() => {
        console.log('[SW] Skip waiting')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Install failed:', error)
      })
  )
})

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache)
            return caches.delete(cache)
          }
        })
      )
    }).then(() => {
      console.log('[SW] Claiming clients')
      return self.clients.claim()
    })
    .catch((error) => {
      console.error('[SW] Activation failed:', error)
    })
  )
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Pular requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return
  }

  // Pular completamente requisições do Supabase para evitar interferência
  if (request.url.includes('supabase.co')) {
    return
  }

  // Network first para APIs
  if (NETWORK_FIRST_URLS.some(pattern => request.url.includes(pattern))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Se conseguiu da rede, retorna
          if (response && response.ok) {
            return response
          }
          throw new Error('Network response not ok')
        })
        .catch(() => {
          // Se falhou, tenta o cache
          return caches.match(request)
        })
    )
    return
  }

  // Cache first para o resto
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response
        }
        
        return fetch(request)
          .then((networkResponse) => {
            // Só cachear recursos da mesma origem e que sejam válidos
            if (networkResponse && networkResponse.ok && url.origin === location.origin) {
              const responseToCache = networkResponse.clone()
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache)
                })
                .catch((error) => {
                  console.warn('[SW] Cache put failed:', error)
                })
            }
            return networkResponse
          })
          .catch((error) => {
            console.warn('[SW] Fetch failed:', error)
            // Para navegação, retornar a página principal
            if (request.mode === 'navigate') {
              return caches.match('/')
            }
            throw error
          })
      })
  )
})
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  }

  event.waitUntil(
    self.registration.showNotification('Fascinar Eventos', options)
  )
})
