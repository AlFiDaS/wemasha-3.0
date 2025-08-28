// Service Worker para WeMasha
const CACHE_NAME = 'wemasha-v1.0.0';
const STATIC_CACHE = 'wemasha-static-v1.0.0';
const IMAGE_CACHE = 'wemasha-images-v1.0.0';

// Archivos críticos para cache inmediato
const CRITICAL_FILES = [
  '/',
  '/galeria',
  '/clientes',
  '/cart',
  '/logo.svg',
  '/favicon.svg'
];

// Archivos estáticos para cache
const STATIC_FILES = [
  '/scripts/galeria.js'
];

// Patrones para cache de imágenes
const IMAGE_PATTERNS = [
  /\/images\/categories\//,
  /\/images\/clientes\//,
  /\/thumbnails\//,
  /\/optimized\//,
  /\.webp$/,
  /\.jpg$/,
  /\.png$/
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache de archivos críticos
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 Cacheando archivos críticos...');
        return cache.addAll(CRITICAL_FILES);
      }),
      
      // Cache de archivos estáticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Cacheando archivos estáticos...');
        return cache.addAll(STATIC_FILES);
      })
    ]).then(() => {
      console.log('✅ Service Worker instalado correctamente');
      return self.skipWaiting();
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activando...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('🗑️ Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Tomar control inmediatamente
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activado');
    })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo procesar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }
  
  // Estrategia para páginas HTML
  if (request.destination === 'document') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          // Actualizar cache en background
          fetch(request).then((freshResponse) => {
            if (freshResponse.ok) {
              const responseClone = freshResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
          });
          return response;
        }
        
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }
  
  // Estrategia para imágenes - DESHABILITADO TEMPORALMENTE PARA DEBUG
  if (request.destination === 'image' || IMAGE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    // Por ahora, no cachear imágenes para evitar problemas con URLs
    // y permitir que se carguen directamente desde el servidor
    event.respondWith(fetch(request));
    return;
  }
  
  // Estrategia para archivos estáticos
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          // Actualizar cache en background
          fetch(request).then((freshResponse) => {
            if (freshResponse.ok) {
              const responseClone = freshResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
          });
          return response;
        }
        
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }
});

// Mensajes del Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    caches.keys().then((cacheNames) => {
      event.ports[0].postMessage({
        type: 'CACHE_INFO',
        cacheNames: cacheNames
      });
    });
  }
});

// Manejo de errores
self.addEventListener('error', (event) => {
  console.error('❌ Error en Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rechazada en Service Worker:', event.reason);
});
