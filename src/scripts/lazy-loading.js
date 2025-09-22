// Lazy Loading optimizado para WeMasha
class LazyLoader {
  constructor() {
    this.observer = null;
    this.images = new Set();
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target);
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px 0px', // Cargar 50px antes de que sea visible
          threshold: 0.01
        }
      );
    } else {
      // Fallback para navegadores antiguos
      this.loadAllImages();
    }
  }

  addImage(img) {
    if (this.observer) {
      this.observer.observe(img);
    } else {
      this.loadImage(img);
    }
  }

  loadImage(img) {
    if (img.dataset.src) {
      // Precargar la imagen
      const tempImage = new Image();
      
      tempImage.onload = () => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        img.classList.add('loaded');
        
        // Trigger evento para animaciones
        img.dispatchEvent(new CustomEvent('imageLoaded'));
      };
      
      tempImage.onerror = () => {
        console.warn('Error cargando imagen:', img.dataset.src);
        img.classList.add('error');
      };
      
      tempImage.src = img.dataset.src;
      delete img.dataset.src;
    }
  }

  loadAllImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.loadImage(img);
    });
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Debouncer para optimizar eventos
function debounce(func, wait) {
  let timeout;
  return function executedFunction() {
    const args = arguments;
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimizador de scroll para la galería
class GalleryOptimizer {
  constructor() {
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.init();
  }

  init() {
    const handleScroll = debounce(() => {
      this.isScrolling = false;
      this.onScrollEnd();
    }, 150);

    window.addEventListener('scroll', () => {
      this.isScrolling = true;
      handleScroll();
    }, { passive: true });
  }

  onScrollEnd() {
    // Optimizar renderizado después del scroll
    document.querySelectorAll('.gallery-item').forEach(item => {
      if (item.classList.contains('visible')) {
        item.style.willChange = 'auto';
      }
    });
  }
}

// Inicializar optimizaciones
let lazyLoader = null;
let galleryOptimizer = null;

function initOptimizations() {
  // Lazy loading
  lazyLoader = new LazyLoader();
  
  // Optimizador de galería
  galleryOptimizer = new GalleryOptimizer();
  
  // Observar imágenes existentes
  document.querySelectorAll('img[data-src]').forEach(img => {
    lazyLoader.addImage(img);
  });
  
  // Observar nuevas imágenes (para navegación SPA)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const images = node.querySelectorAll ? node.querySelectorAll('img[data-src]') : [];
          images.forEach(img => lazyLoader.addImage(img));
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Exportar para uso global
window.LazyLoader = LazyLoader;
window.GalleryOptimizer = GalleryOptimizer;
window.initOptimizations = initOptimizations;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOptimizations);
} else {
  initOptimizations();
}

// Reinicializar en navegación SPA
document.addEventListener('astro:page-load', initOptimizations);
