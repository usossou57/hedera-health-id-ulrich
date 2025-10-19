// Service Worker pour Hedera Health ID PWA
const CACHE_NAME = 'hedera-health-v1.0.0'
const STATIC_CACHE_NAME = 'hedera-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'hedera-dynamic-v1.0.0'

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/ussd',
  '/patient/login',
  '/medecin/login',
  // Ajoutez d'autres routes importantes ici
]

// Ressources API à mettre en cache
const API_CACHE_PATTERNS = [
  /^https:\/\/hedera-health-id-backend\.vercel\.app\/api\/v1\//,
  /^https:\/\/hedera-health-id-backend\.vercel\.app\/health/
]

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installation en cours...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Mise en cache des ressources statiques')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Service Worker: Installation terminée')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('❌ Service Worker: Erreur lors de l\'installation:', error)
      })
  )
})

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activation en cours...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Supprimer les anciens caches
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('hedera-')) {
              console.log('🗑️ Service Worker: Suppression ancien cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Activation terminée')
        return self.clients.claim()
      })
      .catch(error => {
        console.error('❌ Service Worker: Erreur lors de l\'activation:', error)
      })
  )
})

// Interception des requêtes
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return
  }

  // Stratégie pour les ressources statiques
  if (request.method === 'GET' && isStaticAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME))
    return
  }

  // Stratégie pour les API calls
  if (isApiCall(request.url)) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE_NAME))
    return
  }

  // Stratégie par défaut pour les autres ressources
  event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE_NAME))
})

// Vérifier si c'est une ressource statique
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.endsWith(asset)) ||
         url.includes('/assets/') ||
         url.includes('/icons/') ||
         url.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2)$/)
}

// Vérifier si c'est un appel API
function isApiCall(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url))
}

// Stratégie Cache First (pour les ressources statiques)
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      console.log('📦 Cache hit:', request.url)
      return cachedResponse
    }

    console.log('🌐 Cache miss, fetching:', request.url)
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('❌ Cache First Strategy error:', error)
    return new Response('Offline - Resource not available', { status: 503 })
  }
}

// Stratégie Network First (pour les API calls)
async function networkFirstStrategy(request, cacheName) {
  try {
    console.log('🌐 Network first:', request.url)
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('📦 Network failed, trying cache:', request.url)
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    return new Response(JSON.stringify({
      error: 'Offline - Network unavailable',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Stratégie Stale While Revalidate (pour les autres ressources)
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  // Fetch en arrière-plan pour mettre à jour le cache
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(error => {
    console.log('🌐 Network error in background:', error)
  })

  // Retourner immédiatement la version en cache si disponible
  if (cachedResponse) {
    console.log('📦 Stale cache hit:', request.url)
    return cachedResponse
  }

  // Sinon attendre la réponse réseau
  console.log('🌐 No cache, waiting for network:', request.url)
  return fetchPromise
}

// Gestion des messages du client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }).then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
})

// Gestion des notifications push (pour future implémentation)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: data.actions || []
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Gestion des clics sur notifications
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Chercher une fenêtre existante
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

console.log('🚀 Service Worker Hedera Health ID chargé')
