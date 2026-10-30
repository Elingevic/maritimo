import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articulos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articulos' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // La sección se deduce de la subcategoría (ver src/lib/utils.ts); este campo es opcional.
    category: z.enum(['recursos', 'guias', 'vida-a-bordo', 'actualidad']).optional(),
    // Debe coincidir con un id de subcategoría definido en src/config.ts
    subcategory: z.string(),
    // Imagen de portada opcional (ruta dentro de /public, ej. /img/articulos/foto.jpg)
    image: z.string().optional(),
    imageAlt: z.string().optional(),
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
    // Direcciones anteriores del artículo (las añade el panel al cambiar su dirección)
    aliases: z.array(z.string()).optional(),
  }),
});

export const collections = { articulos };
