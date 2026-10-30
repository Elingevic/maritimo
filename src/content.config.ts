import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articulos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articulos' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['recursos', 'guias', 'vida-a-bordo', 'actualidad']),
    // Debe coincidir con un id de subcategoría definido en src/config.ts
    subcategory: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    // Tipo de contenido: se muestra como etiqueta en las tarjetas
    type: z.enum(['guia', 'checklist', 'plantilla', 'glosario', 'articulo', 'noticia']).default('articulo'),
    tags: z.array(z.string()).default([]),
    // Archivo descargable opcional dentro de /public (ej. /descargas/archivo.csv)
    download: z.string().optional(),
    downloadLabel: z.string().optional(),
    // Muestra el botón "Imprimir / Guardar PDF"
    printable: z.boolean().default(false),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articulos };
