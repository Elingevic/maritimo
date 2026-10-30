// Configuración central del sitio.
// Los datos que se editan desde el panel (/admin/) están en src/data/*.json;
// aquí se combinan con lo que es estructura del sitio (secciones, subcategorías).
import ajustesJson from './data/ajustes.json';
import anunciosJson from './data/anunciantes.json';
import seccionesJson from './data/secciones.json';
import inicioJson from './data/inicio.json';
import paginasJson from './data/paginas.json';

// Textos de la portada y de las páginas fijas (Páginas → Inicio / Contacto / Anúnciate…).
// Se leen como opcionales porque el panel omite los campos vacíos.
type Bloque = Partial<Record<'imagen' | 'kicker' | 'titulo' | 'tituloDestacado' | 'texto' | 'boton1' | 'boton2', string>>;
const inicioData = inicioJson as Partial<Record<'hero' | 'secciones' | 'destacados' | 'ultimos' | 'anunciantes', Bloque>>;
export const INICIO = {
  hero: inicioData.hero ?? {},
  secciones: inicioData.secciones ?? {},
  destacados: inicioData.destacados ?? {},
  ultimos: inicioData.ultimos ?? {},
  anunciantes: inicioData.anunciantes ?? {},
};
type PaginaTextos = Partial<Record<'kicker' | 'titulo' | 'texto' | 'consejo' | 'condiciones', string>>;
export const PAGINAS = paginasJson as Partial<Record<'contacto' | 'anunciate' | 'publicaciones', PaginaTextos>>;

// El panel omite los campos opcionales vacíos, así que se leen como opcionales
const ajustes = ajustesJson as Partial<Record<string, string>>;
const anuncios = anunciosJson as {
  anunciosGratis?: boolean;
  huecos?: number;
  anunciantes?: { nombre?: string; descripcion?: string; enlace?: string; logo?: string }[];
};

export const SITE = {
  name: ajustes.nombre || 'Rumbo Mercante',
  slogan: ajustes.eslogan || '',
  description: ajustes.descripcion || '',
  footerPhrase: ajustes.fraseFooter || '',
  footerMotto: ajustes.lemaFooter || '',
  author: ajustes.autor || 'Jhonny Castorani',
  authorRole: ajustes.cargo || '',
  authorSummary: ajustes.resumenAutor || '',
  legacyBlog: ajustes.blogAnterior || 'https://ingmaritima.blogspot.com',
  // Correo que recibe los mensajes del formulario de contacto.
  contactEmail: ajustes.correoContacto || '',
  // Opcional: ID de Formspree (https://formspree.io). Vacío = el formulario abre el correo del visitante.
  formspreeId: (ajustes.formspreeId ?? '').trim(),
  locale: 'es',
};

export type CategoryId = 'recursos' | 'guias' | 'vida-a-bordo' | 'actualidad';

export interface Subcategory {
  id: string;
  name: string;
  description: string;
}

export interface Category {
  id: CategoryId;
  subcategories: Subcategory[];
  name: string;
  short: string;
  kicker: string;
  description: string;
  icon: 'toolbox' | 'compass' | 'anchor' | 'radar';
  color: string;
}

// Textos editables desde el panel (Páginas → Secciones y subcategorías).
// El icono y el color de cada sección son fijos y dependen de su id.
const SECTION_STYLE: Record<CategoryId, Pick<Category, 'icon' | 'color'>> = {
  recursos: { icon: 'toolbox', color: 'var(--c-recursos)' },
  guias: { icon: 'compass', color: 'var(--c-guias)' },
  'vida-a-bordo': { icon: 'anchor', color: 'var(--c-vida)' },
  actualidad: { icon: 'radar', color: 'var(--c-actualidad)' },
};
const ORDER = Object.keys(SECTION_STYLE) as CategoryId[];

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

type SeccionJson = {
  id?: string;
  nombre?: string;
  corto?: string;
  kicker?: string;
  descripcion?: string;
  subcategorias?: { id?: string; nombre?: string; descripcion?: string }[];
};
const seccionesData = (seccionesJson as { secciones?: SeccionJson[] }).secciones ?? [];

export const CATEGORIES: Category[] = ORDER.map((id) => {
  const s = seccionesData.find((x) => x.id === id) ?? {};
  const seen = new Set<string>();
  const subcategories = (s.subcategorias ?? [])
    .filter((sub) => sub.nombre?.trim())
    // Si el editor no escribe un identificador, se genera a partir del nombre
    .map((sub) => ({ id: slugify(sub.id?.trim() || sub.nombre!), name: sub.nombre!.trim(), description: sub.descripcion?.trim() ?? '' }))
    .filter((sub) => sub.id && !seen.has(sub.id) && seen.add(sub.id));
  return {
    id,
    name: s.nombre?.trim() || id,
    short: s.corto?.trim() || s.nombre?.trim() || id,
    kicker: s.kicker?.trim() ?? '',
    description: s.descripcion?.trim() ?? '',
    subcategories,
    ...SECTION_STYLE[id],
  };
});

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
export const getSubcategory = (cat: string, sub: string) =>
  getCategory(cat)?.subcategories.find((s) => s.id === sub);
// Los ids de subcategoría son únicos en todo el sitio: permiten deducir la sección
export const findCategoryOfSubcategory = (sub: string) =>
  CATEGORIES.find((c) => c.subcategories.some((s) => s.id === sub));

export const NAV = [
  ...CATEGORIES.map((c) => ({ href: `/${c.id}/`, label: c.short })),
  { href: '/nosotros/', label: 'Nosotros' },
];

export const TOOLS = [
  {
    href: '/recursos/herramientas/calculadora-descanso/',
    title: 'Calculadora de horas de descanso',
    description:
      'Marca tus horas de trabajo y comprueba al instante si cumples los mínimos de descanso del STCW y el MLC 2006.',
    tag: 'Herramienta',
  },
  {
    href: '/recursos/herramientas/conversor-unidades/',
    title: 'Conversor de unidades marítimas',
    description:
      'Presión, temperatura, potencia, volumen, velocidad y distancia: las conversiones que usas en cada guardia.',
    tag: 'Herramienta',
  },
];

// ---------------------------------------------------------------------------
// Anunciantes / patrocinadores (se editan desde el panel: Ajustes → Anunciantes)
// ---------------------------------------------------------------------------
export interface Advertiser {
  name: string;
  description: string;
  href: string;
  logo?: string;
}
export const ADVERTISERS: Advertiser[] = (anuncios.anunciantes ?? [])
  .filter((a) => a.nombre && a.enlace)
  .map((a) => ({ name: a.nombre!, description: a.descripcion ?? '', href: a.enlace!, logo: a.logo || undefined }));
export const AD_SLOTS = Math.max(ADVERTISERS.length, Number(anuncios.huecos) || 0);
export const ADS_FREE = anuncios.anunciosGratis !== false;
