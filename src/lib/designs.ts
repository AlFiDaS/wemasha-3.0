// src/lib/designs.ts
export type Design = { 
  src: string; 
  name: string; 
  category: string;
  thumbnail: string;
  size?: number;
};

function niceName(file: string) {
  return file
    .replace(/\.(png|jpg|jpeg|webp|svg)$/i, "")
    .split("/").pop()!
    .replace(/[-_]+/g, " ")
    .trim();
}


// Función para generar thumbnail URL
function generateThumbnailUrl(originalUrl: string): string {
  // Si ya es un thumbnail, devolver como está
  if (originalUrl.includes('thumbnail')) {
    return originalUrl;
  }
  
  // Para desarrollo, usar la imagen original
  // En producción, esto se reemplazaría con URLs de thumbnails reales
  return originalUrl;
}

const modules = import.meta.glob("../assets/designs/**/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  query: "?url",
  import: "default",
});

export const designs: Design[] = Object.entries(modules).map(([path, url]) => {
  const parts = path.split("/");
  const i = parts.lastIndexOf("designs");
  const category = parts[i + 1] || "otros";
  const originalUrl = url as string;
  
  return { 
    src: originalUrl, 
    name: niceName(path), 
    category,
    thumbnail: generateThumbnailUrl(originalUrl),
  };
}).sort((a, b) => a.category.localeCompare(b.category));

export function preloadImages(designs: Design[], startIndex: number, count: number, useThumbnails: boolean = true) {
  const slice = designs.slice(startIndex, startIndex + count);
  slice.forEach(design => {
    const img = new Image();
    img.src = useThumbnails ? design.thumbnail : design.src;
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
  return useThumbnail ? design.thumbnail : design.src;
}
