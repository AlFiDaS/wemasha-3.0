// src/lib/designs.ts
export type Design = { src: string; name: string; category: string };

function niceName(file: string) {
  return file
    .replace(/\.(png|jpg|jpeg|webp|svg)$/i, "")
    .split("/").pop()!
    .replace(/[-_]+/g, " ")
    .trim();
}

// Importar desde src/assets/designs/**  (NO public/)
const modules = import.meta.glob("../assets/designs/**/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  query: "?url",
  import: "default",
});

export const designs: Design[] = Object.entries(modules).map(([path, url]) => {
  const parts = path.split("/");
  const i = parts.lastIndexOf("designs");
  const category = parts[i + 1] || "otros";
  return { src: url as string, name: niceName(path), category };
}).sort((a, b) => a.category.localeCompare(b.category));

