// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  
  // Optimización de imágenes
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    // Configuración de formatos y calidades
    formats: ['webp', 'avif'],
    quality: 80,
    // Generar múltiples tamaños para responsive
    densities: [1, 2],
    // Configuración de thumbnails
    outputDir: './dist/assets',
  },
  
  // Optimización de build
  build: {
    // Comprimir assets
    assets: '_astro',
    // Inline CSS crítico
    inlineStylesheets: 'auto',
  },
  
  // Configuración de desarrollo
  dev: {
    // Hot reload optimizado
    host: true,
  },
  
  // Configuración de servidor
  server: {
    // Headers de cache para imágenes
    headers: {
      '*.webp': {
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
      '*.jpg': {
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
      '*.png': {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    }
  }
});