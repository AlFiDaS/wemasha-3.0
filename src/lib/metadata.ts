// Utilidades para generar metadatos específicos por artista y categoría

export interface ArtistMetadata {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

export const artistMetadata: Record<string, ArtistMetadata> = {
  // Estas metadatos se pueden usar para páginas específicas de productos o subcategorías
  'duki': {
    title: 'Duki - Remeras y Buzos Oficiales | WeMasha',
    description: 'Remeras y buzos oficiales de Duki. Descubre diseños exclusivos del artista argentino con sus canciones más populares como "Goteo", "She Don\'t Give a FO", "Antes de Perderte", "Modo Diablo" y más. Streetwear auténtico de Duki.',
    keywords: 'duki remeras, duki buzos, remeras duki oficial, she don give a fo, goteo, antes de perderte, modo diablo, duki streetwear, remeras trap argentino, duki artista',
    ogImage: '/images/categories/artistas.jpg'
  },
  'jonas-brothers': {
    title: 'Jonas Brothers - Remeras y Buzos Oficiales | WeMasha',
    description: 'Remeras y buzos oficiales de Jonas Brothers. Descubre diseños exclusivos de Joe, Nick y Kevin Jonas con sus canciones más populares como "Sucker", "What a Man Gotta Do", "Only Human", "Lovebug" y más.',
    keywords: 'jonas brothers remeras, jonas brothers buzos, joe jonas, nick jonas, kevin jonas, sucker, what a man gotta do, only human, lovebug, jonas brothers streetwear',
    ogImage: '/images/categories/artistas.jpg'
  },
  'taylor-swift': {
    title: 'Taylor Swift - Remeras y Buzos Oficiales | WeMasha',
    description: 'Remeras y buzos oficiales de Taylor Swift. Descubre diseños exclusivos de la artista con sus álbumes más populares como "1989", "Reputation", "Lover", "Folklore", "Evermore", "Midnights" y más.',
    keywords: 'taylor swift remeras, taylor swift buzos, 1989, reputation, lover, folklore, evermore, midnights, taylor swift streetwear, swiftie merch',
    ogImage: '/images/categories/artistas.jpg'
  },
  'harry-styles': {
    title: 'Harry Styles - Remeras y Buzos Oficiales | WeMasha',
    description: 'Remeras y buzos oficiales de Harry Styles. Descubre diseños exclusivos del artista con sus álbumes "Harry Styles", "Fine Line", "Harry\'s House" y canciones como "As It Was", "Watermelon Sugar", "Sign of the Times".',
    keywords: 'harry styles remeras, harry styles buzos, as it was, watermelon sugar, sign of the times, fine line, harry\'s house, harry styles streetwear',
    ogImage: '/images/categories/artistas.jpg'
  },
  'slipknot': {
    title: 'Slipknot - Remeras y Buzos Oficiales | WeMasha',
    description: 'Remeras y buzos oficiales de Slipknot. Descubre diseños exclusivos de la banda de metal con sus álbumes más populares y canciones como "Psychosocial", "Duality", "Before I Forget", "The Devil in I" y más.',
    keywords: 'slipknot remeras, slipknot buzos, psychosocial, duality, before i forget, the devil in i, slipknot metal, slipknot streetwear',
    ogImage: '/images/categories/artistas.jpg'
  },
  'emilia-mernes': {
    title: 'Emilia Mernes - Remeras y Buzos Oficiales | WeMasha',
    description: 'Remeras y buzos oficiales de Emilia Mernes. Descubre diseños exclusivos de la artista argentina con sus canciones más populares como "Rápido Lento", "La Chain", "No Se Ve", "Cuatro Veinte" y más.',
    keywords: 'emilia mernes remeras, emilia mernes buzos, rápido lento, la chain, no se ve, cuatro veinte, emilia mernes streetwear, remeras trap argentino',
    ogImage: '/images/categories/artistas.jpg'
  }
};

export const categoryMetadata: Record<string, ArtistMetadata> = {
  'nba': {
    title: 'NBA - Remeras y Buzos Oficiales | WeMasha',
    description: 'Remeras y buzos con diseños de la NBA. Descubre prendas con tus equipos favoritos, jugadores legendarios y diseños únicos de basketball. Streetwear deportivo de alta calidad.',
    keywords: 'remeras nba, buzos nba, basketball, equipos nba, jugadores nba, streetwear deportivo, remeras basketball',
    ogImage: '/images/categories/nba.jpg'
  },
  'futbol': {
    title: 'Fútbol - Remeras y Buzos Oficiales | WeMasha',
    description: 'Remeras y buzos con diseños de fútbol. Descubre prendas con Messi, equipos argentinos, estadios legendarios como La Bombonera y El Monumental. Diseños únicos de fútbol argentino.',
    keywords: 'remeras futbol, buzos futbol, messi remeras, bombonera, monumental, equipos argentinos, futbol argentino, streetwear futbol',
    ogImage: '/images/categories/futbol.jpg'
  },
  'f1-y-autos': {
    title: 'F1 y Autos - Remeras y Buzos Oficiales | WeMasha',
    description: 'Remeras y buzos con diseños de Fórmula 1 y autos. Descubre prendas con pilotos como Verstappen, Leclerc, Alonso, y diseños de autos clásicos como Back to the Future, Fast & Furious y más.',
    keywords: 'remeras f1, buzos f1, formula 1, verstappen, leclerc, alonso, back to the future, fast and furious, autos clásicos, streetwear f1',
    ogImage: '/images/categories/autos.jpg'
  },
  'personalizados': {
    title: 'Diseños Personalizados - WeMasha',
    description: 'Crea tu diseño personalizado único. Remeras y buzos con tus artistas favoritos, mascotas, nombres o cualquier diseño que desees. Diseños exclusivos y personalizados para ti.',
    keywords: 'diseños personalizados, remeras personalizadas, buzos personalizados, artistas favoritos, mascotas, nombres personalizados, diseños únicos, streetwear personalizado',
    ogImage: '/images/categories/personalizado.png'
  }
};

export function getMetadataForArtist(artistSlug: string): ArtistMetadata | null {
  return artistMetadata[artistSlug] || null;
}

export function getMetadataForCategory(categorySlug: string): ArtistMetadata | null {
  return categoryMetadata[categorySlug] || null;
}

export function generateCanonicalUrl(path: string): string {
  const baseUrl = 'https://wemasha.com';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
