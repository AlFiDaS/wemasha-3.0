// Métricas de rendimiento para WeMasha
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    // Métricas de Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();
    
    // Métricas personalizadas
    this.observeImageLoadTimes();
    this.observeNavigationTimes();
  }

  observeLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.reportMetric('LCP', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  observeFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.reportMetric('FID', this.metrics.fid);
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  observeCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cls = clsValue;
            // this.reportMetric('CLS', clsValue); // Deshabilitado temporalmente
          }
        });
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  observeFCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        this.metrics.fcp = firstEntry.startTime;
        this.reportMetric('FCP', firstEntry.startTime);
      });
      observer.observe({ entryTypes: ['first-contentful-paint'] });
    }
  }

  observeTTFB() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.initiatorType === 'navigation') {
            this.metrics.ttfb = entry.responseStart - entry.requestStart;
            this.reportMetric('TTFB', this.metrics.ttfb);
          }
        });
      });
      observer.observe({ entryTypes: ['navigation'] });
    }
  }

  observeImageLoadTimes() {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      const startTime = performance.now();
      
      img.addEventListener('load', () => {
        const loadTime = performance.now() - startTime;
        this.reportMetric('ImageLoad', loadTime, img.src);
      });
      
      img.addEventListener('error', () => {
        this.reportMetric('ImageError', 0, img.src);
      });
    });
  }

  observeNavigationTimes() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.metrics.navigation = {
              domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              loadComplete: entry.loadEventEnd - entry.loadEventStart,
              domInteractive: entry.domInteractive - entry.fetchStart
            };
            this.reportMetric('Navigation', this.metrics.navigation);
          }
        });
      });
      observer.observe({ entryTypes: ['navigation'] });
    }
  }

  reportMetric(name, value, context = '') {
    const metric = {
      name,
      value: Math.round(value * 100) / 100,
      timestamp: Date.now(),
      url: window.location.href,
      context
    };

    // Log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${name}: ${value}ms`, context ? `(${context})` : '');
    }

    // Enviar a analytics si está configurado
    this.sendToAnalytics(metric);
  }

  sendToAnalytics(metric) {
    // Aquí puedes integrar con Google Analytics, Plausible, etc.
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        page_url: metric.url
      });
    }
  }

  getMetrics() {
    return this.metrics;
  }

  // Métricas de memoria
  getMemoryInfo() {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  // Métricas de red
  getNetworkInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      };
    }
    return null;
  }
}

// Inicializar monitor de rendimiento
let performanceMonitor = null;

function initPerformanceMonitoring() {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
    
    // Exponer globalmente para debugging
    window.performanceMonitor = performanceMonitor;
    
    console.log('📊 Monitor de rendimiento inicializado');
  }
}

// Auto-inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPerformanceMonitoring);
} else {
  initPerformanceMonitoring();
}

// Reinicializar en navegación SPA
document.addEventListener('astro:page-load', initPerformanceMonitoring);

// Exportar para uso global
window.PerformanceMonitor = PerformanceMonitor;
window.initPerformanceMonitoring = initPerformanceMonitoring;
