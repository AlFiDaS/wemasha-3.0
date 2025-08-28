// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://wemasha.hechoencorrientes.com/',
  integrations: [tailwind()],
  image: { 
    service: { entrypoint: 'astro/assets/services/sharp' }
  },
  build: { 
    assets: '_astro', 
    inlineStylesheets: 'auto'
  },
  server: { host: true },
  // Configuración para evitar que Astro procese las imágenes optimizadas
  vite: {
    build: {
      rollupOptions: {
        external: (id) => {
          // Excluir las imágenes optimizadas del procesamiento de Astro
          return id.includes('/thumbnails/') || id.includes('/optimized/');
        }
      }
    }
  }
});