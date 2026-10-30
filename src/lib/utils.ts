import { getCollection, type CollectionEntry } from 'astro:content';
import { getSubcategory } from '../config';

export type Articulo = CollectionEntry<'articulos'>;

export async function getArticulos(category?: string): Promise<Articulo[]> {
  const all = await getCollection('articulos', ({ data }) => !data.draft);
  for (const a of all) {
    if (!getSubcategory(a.data.category, a.data.subcategory)) {
      throw new Error(
        `El artículo "${a.id}" usa la subcategoría "${a.data.subcategory}", que no existe en "${a.data.category}". Revisa src/config.ts.`,
      );
    }
  }
  return all
    .filter((a) => !category || a.data.category === category)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const articleUrl = (a: Articulo) => `/${a.data.category}/${a.data.subcategory}/${a.id}/`;

export function formatDate(date: Date) {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function readingTime(body = '') {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export const TYPE_LABEL: Record<string, string> = {
  guia: 'Guía',
  checklist: 'Checklist',
  plantilla: 'Plantilla',
  glosario: 'Glosario',
  articulo: 'Artículo',
  noticia: 'Noticia',
};
