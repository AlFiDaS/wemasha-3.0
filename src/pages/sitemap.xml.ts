import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('site is not defined in astro.config.mjs');
  }

  // Obtener todas las categorías
  const categorias = await getCollection('categorias');
  
  // Obtener todos los productos
  const productos = await getCollection('productos');

  // Páginas estáticas principales
  const staticPages = [
    '',
    '/galeria',
    '/clientes',
    '/cart'
  ];

  // Generar URLs de categorías
  const categoryUrls = categorias.map(categoria => `/${categoria.slug}`);

  // Generar URLs de productos (categoría/diseño)
  const productUrls = productos.map(producto => {
    const categorySlug = producto.data.category;
    return `/${categorySlug}/${producto.data.designSlug}`;
  });

  // Combinar todas las URLs
  const allUrls = [...staticPages, ...categoryUrls, ...productUrls];

  // Crear el XML del sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(url => `
  <url>
    <loc>${site}${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === '' ? '1.0' : url === '/galeria' ? '0.9' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
