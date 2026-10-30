import { getCollection, type CollectionEntry } from 'astro:content';
import { findCategoryOfSubcategory, type CategoryId } from '../config';

type Entry = CollectionEntry<'articulos'>;
// Tras normalizar, la sección siempre está definida
export type Articulo = Entry & { data: Entry['data'] & { category: CategoryId } };

async function loadAll(): Promise<Articulo[]> {
  const all = await getCollection('articulos', ({ data }) => !data.draft);
  const ok: Articulo[] = [];
  for (const a of all) {
    const cat = findCategoryOfSubcategory(a.data.subcategory);
    if (!cat) {
      // No se rompe la publicación del sitio: el artículo se omite hasta que se corrija su subcategoría
      console.warn(`[rumbo] "${a.id}" usa la subcategoría "${a.data.subcategory}", que no existe: no se publica.`);
      continue;
    }
    // La subcategoría manda: evita combinaciones sección/subcategoría incoherentes
    a.data.category = cat.id;
    ok.push(a as Articulo);
  }
  return ok.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getArticulos(category?: string): Promise<Articulo[]> {
  const all = await loadAll();
  return category ? all.filter((a) => a.data.category === category) : all;
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
