// Script para debugging de problemas de caché
// Este script ayuda a identificar y resolver problemas relacionados con el Service Worker

export function debugCacheIssues() {
  console.log('🔍 Iniciando diagnóstico de caché...');
  
  // Verificar si el Service Worker está activo
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log(`📋 Service Workers registrados: ${registrations.length}`);
      registrations.forEach((registration, index) => {
        console.log(`  ${index + 1}. Scope: ${registration.scope}`);
        console.log(`     Estado: ${registration.active ? 'Activo' : 'Inactivo'}`);
      });
    });
  } else {
    console.log('❌ Service Worker no soportado');
  }
  
  // Verificar caches disponibles
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      console.log(`📦 Caches disponibles: ${cacheNames.length}`);
      cacheNames.forEach(cacheName => {
        console.log(`  - ${cacheName}`);
      });
    });
  }
  
  // Verificar si la página actual está cacheada
  const currentUrl = window.location.href;
  if ('caches' in window) {
    caches.match(currentUrl).then(response => {
      if (response) {
        console.log('⚠️ La página actual está cacheada');
        console.log('   Esto puede causar problemas de contenido desactualizado');
      } else {
        console.log('✅ La página actual no está cacheada');
      }
    });
  }
}

export function forceCacheRefresh() {
  console.log('🔄 Forzando actualización de caché...');
  
  // Desregistrar Service Workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('🗑️ Service Worker desregistrado');
      });
    });
  }
  
  // Limpiar todos los caches
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
        console.log(`🗑️ Cache eliminado: ${cacheName}`);
      });
    });
  }
  
  // Recargar la página después de un breve delay
  setTimeout(() => {
    console.log('🔄 Recargando página...');
    window.location.reload();
  }, 1500);
}

// Función para verificar si hay problemas de navegación
export function checkNavigationIssues() {
  console.log('🧭 Verificando problemas de navegación...');
  
  // Verificar si estamos en una SPA (Single Page Application)
  const isSPA = document.querySelector('[data-astro-reload]') !== null;
  console.log(`📱 Tipo de aplicación: ${isSPA ? 'SPA' : 'MPA'}`);
  
  // Verificar eventos de navegación
  let navigationCount = 0;
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function() {
    navigationCount++;
    console.log(`🧭 Navegación ${navigationCount}: pushState`);
    return originalPushState.apply(this, arguments);
  };
  
  history.replaceState = function() {
    navigationCount++;
    console.log(`🧭 Navegación ${navigationCount}: replaceState`);
    return originalReplaceState.apply(this, arguments);
  };
  
  // Escuchar eventos de popstate
  window.addEventListener('popstate', () => {
    console.log('🧭 Evento popstate detectado');
  });
  
  console.log('✅ Monitoreo de navegación activado');
}

// Auto-inicializar cuando se carga el script
if (typeof window !== 'undefined') {
  // Agregar funciones globales para debugging
  window.debugCache = debugCacheIssues;
  window.forceRefresh = forceCacheRefresh;
  window.checkNavigation = checkNavigationIssues;
  
  // Ejecutar diagnóstico automático en desarrollo
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Modo desarrollo detectado - ejecutando diagnóstico automático');
    setTimeout(debugCacheIssues, 1000);
  }
}
