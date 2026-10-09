const CACHE_NAME = 'bitacora-viajes-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.webmanifest'
];

// Instalación: Pre-cachear el esqueleto esencial de la app
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpieza de versiones anteriores del caché
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptor de peticiones (Fetch)
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Solo interceptar peticiones GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // No interceptar llamadas al API, extensiones ni websockets de desarrollo
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/divisas') ||
    url.hostname.includes('onrender.com') ||
    url.protocol.startsWith('chrome-extension') ||
    url.pathname.includes('/@vite') ||
    url.pathname.includes('/@react-refresh')
  ) {
    return;
  }

  // Para navegación de páginas (HTML), usar estrategia Network-First con fallback a index.html en caché
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match('/index.html');
          return cachedResponse || caches.match(request);
        })
    );
    return;
  }

  // Para assets estáticos (JS, CSS, fuentes, SVG): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si falla la red, el cachedResponse resolverá
        });

      return cachedResponse || fetchPromise;
    })
  );
});
