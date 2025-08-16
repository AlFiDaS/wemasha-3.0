import { defineCollection, reference, z } from "astro:content";

const productosCollection = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        designSlug: z.string(),
        //category: z.string(),
        //categorySlug: z.string(),
        image: z.string(),
         imageHover: z.string(),
        prendas: z.array(
            z.object({ title: z.string(), slug: z.string(), image: z.string(), price: z.string(), talles: z.string() })
        ),
        category: reference('categorias'),
  }),
});

const categoriasCollection = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        catSlug: z.string(),
        image: z.string(),
        description: z.string().optional(),
        keywords: z.string().optional(),
    }),
});

export const collections = { 
    productos: productosCollection, 
    categorias: categoriasCollection 
};