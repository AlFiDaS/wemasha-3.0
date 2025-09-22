// Script específico para manejar problemas de navegación en la galería
// Este script se asegura de que la galería siempre cargue contenido fresco

export function initGaleriaNavigation() {
  console.log('🎨 Inicializando navegación de galería...');
  
  // Verificar si estamos en la página de galería
  if (!window.location.pathname.includes('/galeria')) {
    return;
  }
  
  // Función para verificar si el contenido está actualizado
  function checkContentFreshness() {
    const currentTime = Date.now();
    const lastUpdate = sessionStorage.getItem('galeria_last_update');
    
    // Si no hay timestamp o han pasado más de 5 minutos, considerar contenido desactualizado
    if (!lastUpdate || (currentTime - parseInt(lastUpdate)) > 300000) {
      console.log('⚠️ Contenido de galería puede estar desactualizado');
      return false;
    }
    
    return true;
  }
  
  // Función para marcar contenido como actualizado
  function markContentAsFresh() {
    sessionStorage.setItem('galeria_last_update', Date.now().toString());
    console.log('✅ Contenido de galería marcado como actualizado');
  }
  
  // Función para forzar recarga de contenido
  function forceContentReload() {
    console.log('🔄 Forzando recarga de contenido de galería...');
    
    // Limpiar caché específico de la galería
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('wemasha')) {
            caches.delete(cacheName);
            console.log(`🗑️ Cache de galería eliminado: ${cacheName}`);
          }
        });
      });
    }
    
    // Recargar la página
    window.location.reload();
  }
  
  // Escuchar eventos de navegación
  let navigationTimeout;
  
  function handleNavigation() {
    // Limpiar timeout anterior
    if (navigationTimeout) {
      clearTimeout(navigationTimeout);
    }
    
    // Verificar contenido después de un breve delay
    navigationTimeout = setTimeout(() => {
      if (!checkContentFreshness()) {
        console.log('🔄 Navegación detectada - verificando contenido...');
        // No forzar recarga automáticamente, solo marcar para verificación
      }
    }, 100);
  }
  
  // Escuchar eventos de navegación de Astro
  document.addEventListener('astro:page-load', () => {
    console.log('📄 Página cargada - verificando contenido...');
    handleNavigation();
  });
  
  // Escuchar cambios en el historial
  window.addEventListener('popstate', handleNavigation);
  
  // Interceptar clicks en enlaces de navegación
  document.addEventListener('click', (e) => {
    const target = e.target;
    const link = target.closest('a');
    
    if (link && link.href && link.href.includes('/galeria')) {
      console.log('🔗 Navegación a galería detectada');
      handleNavigation();
    }
  });
  
  // Marcar contenido como fresco cuando se carga completamente
  window.addEventListener('load', () => {
    markContentAsFresh();
  });
  
  // Agregar funciones globales para debugging
  window.checkGaleriaContent = checkContentFreshness;
  window.reloadGaleria = forceContentReload;
  window.markGaleriaFresh = markContentAsFresh;
  
  console.log('✅ Navegación de galería inicializada');
}

// Auto-inicializar
if (typeof window !== 'undefined') {
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGaleriaNavigation);
  } else {
    initGaleriaNavigation();
  }
  
  // También inicializar en cambios de página (para SPA)
  document.addEventListener('astro:page-load', initGaleriaNavigation);
}
