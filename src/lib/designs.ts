// src/lib/designs.ts
export type Design = {
  src: string;
  name: string;
  category: string;
  thumbnail: string;
  optimized: string;
  size?: number;
};

function niceName(file: string) {
  return file
    .replace(/\.(png|jpg|jpeg|webp|svg)$/i, "")
    .split("/").pop()!
    .replace(/[-_]+/g, " ")
    .trim();
}

// Función para generar URLs optimizadas
function generateOptimizedUrls(originalUrl: string): { thumbnail: string; optimized: string } {
  // Si ya es una URL optimizada, devolver como está
  if (originalUrl.includes('optimized') || originalUrl.includes('thumbnails')) {
    return {
      thumbnail: originalUrl,
      optimized: originalUrl
    };
  }
  
  // Extraer el nombre del archivo y la categoría
  const urlParts = originalUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];
  const fileNameWithoutExt = fileName.replace(/\.(png|jpg|jpeg|webp|svg)$/i, '');
  const category = urlParts[urlParts.length - 2] || 'otros';
  
  return {
    thumbnail: `/thumbnails/${category}/${fileNameWithoutExt}.webp`,
    optimized: `/optimized/${category}/${fileNameWithoutExt}.webp`
  };
}

const modules = import.meta.glob("../assets/designs/**/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  query: "?url",
  import: "default",
});

export const designs: Design[] = Object.entries(modules)
  .map(([path, url]) => {
    const parts = path.split("/");
    const i = parts.lastIndexOf("designs");
    const category = parts[i + 1] || "otros";
    const originalUrl = url as string;
    const { thumbnail, optimized } = generateOptimizedUrls(originalUrl);
    
    return {
      src: originalUrl,
      name: niceName(path),
      category,
      thumbnail,
      optimized,
    };
  })
  .sort((a, b) => a.category.localeCompare(b.category));

export function preloadImages(
  list: Design[],
  startIndex: number,
  count: number,
  useThumbnails: boolean = true
) {
  const slice = list.slice(startIndex, startIndex + count);
  slice.forEach((design) => {
    const img = new Image();
    img.src = useThumbnails ? design.thumbnail : design.optimized;
  });
}

export function getDesignsWithLazyLoading(
  allDesigns: Design[],
  currentPage: number,
  perPage: number,
  preloadNext: boolean = true,
  useThumbnails: boolean = true
) {
  const start = currentPage * perPage;
  const end = start + perPage;

  if (preloadNext) {
    preloadImages(allDesigns, start, perPage * 2, useThumbnails);
  } else {
    preloadImages(allDesigns, start, perPage, useThumbnails);
  }

  return allDesigns.slice(start, end);
}

export function getOptimizedImageUrl(design: Design, useThumbnail: boolean = true): string {
  return useThumbnail ? design.thumbnail : design.optimized;
}

// Función para obtener la URL más apropiada según el contexto
export function getImageUrl(design: Design, context: 'thumbnail' | 'gallery' | 'full' = 'gallery'): string {
  switch (context) {
    case 'thumbnail':
      return design.thumbnail;
    case 'gallery':
      return design.optimized;
    case 'full':
      return design.src;
    default:
      return design.optimized;
  }
}
  