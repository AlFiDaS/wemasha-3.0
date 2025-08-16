// Utilidades para el proyecto WeMasha

/**
 * Convierte un slug de categoría a su nombre legible
 */
export function getCategoryDisplayName(slug: string): string {
  const categoryMap: Record<string, string> = {
    '01_artistas': 'Artistas',
    '0_recientes': 'Recientes',
    'f1-y-autos': 'F1 y Autos',
    'personalizados': 'Personalizados',
    'nba': 'NBA',
    'futbol': 'Fútbol'
  };
  
  return categoryMap[slug] || slug;
}

/**
 * Formatea un precio para mostrar en la interfaz
 */
export function formatPrice(price: number): string {
  return `AR$ ${price.toLocaleString('es-AR')}`;
}
