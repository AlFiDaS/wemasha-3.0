import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const categorias = await getCollection('categorias');
  
  // Páginas principales
  const staticPages = [
    {
      url: site?.href || 'https://wemasha.hechoencorrientes.com',
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '1.0'
    },
    {
      url: `${site?.href || 'https://wemasha.hechoencorrientes.com'}galeria`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      url: `${site?.href || 'https://wemasha.hechoencorrientes.com'}tudiseno`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${site?.href || 'https://wemasha.hechoencorrientes.com'}clientes`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.7'
    }
  ];

  // Páginas de categorías
  const categoryPages = categorias.map(categoria => ({
    url: `${site?.href || 'https://wemasha.hechoencorrientes.com'}${categoria.slug}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: '0.8'
  }));

  const allPages = [...staticPages, ...categoryPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};