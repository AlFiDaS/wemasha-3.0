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
  
  // ---- Generar URL de thumbnail ----
  // ---- Generar URL de thumbnail ----
function generateThumbnailUrl(originalUrl: string): string {
  if (originalUrl.includes("thumbnail")) return originalUrl;
  const urlParts = originalUrl.split("/");
  const fileName = urlParts[urlParts.length - 1];
  return "/thumbnails/" + fileName;
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
      return {
        src: originalUrl,
        name: niceName(path),
        category,
        thumbnail: generateThumbnailUrl(originalUrl),
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
  