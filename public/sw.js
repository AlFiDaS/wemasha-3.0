// Service Worker para WeMasha 3.0
// Cache de imágenes y optimización de rendimiento

const CACHE_NAME = 'wemasha-gallery-v1';
const IMAGE_CACHE_NAME = 'wemasha-images-v1';

// Archivos a cachear inmediatamente
const STATIC_ASSETS = [
  '/',
  '/galeria',
  '/images/mockups/adelante.webp',
  '/images/mockups/atras.webp',
  '/logo.svg',
  '/favicon.svg'
];

// Estrategia: Cache First para imágenes
async function cacheFirst(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Si falla la red, devolver una imagen placeholder
    return new Response('', {
      status: 404,
      statusText: 'Image not found'
    });
  }
}

// Estrategia: Network First para páginas
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('🔄 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Cacheando assets estáticos...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('✅ Service Worker activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Cachear imágenes de la galería
  if (request.destination === 'image' || 
      url.pathname.includes('/images/') || 
      url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Cachear páginas HTML
  if (request.destination === 'document' || 
      request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Para otros recursos, usar estrategia por defecto
  event.respondWith(fetch(request));
});

// Mensajes del cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_IMAGES') {
    const images = event.data.images || [];
    event.waitUntil(
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        return Promise.all(
          images.map(imageUrl => {
            return fetch(imageUrl).then(response => {
              if (response.ok) {
                return cache.put(imageUrl, response);
              }
            }).catch(error => {
              console.log('Error cacheando imagen:', imageUrl, error);
            });
          })
        );
      })
    );
  }
});
