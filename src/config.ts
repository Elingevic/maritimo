// Configuración central del sitio.
// Los datos que se editan desde el panel (/admin/) están en src/data/*.json;
// aquí se combinan con lo que es estructura del sitio (secciones, subcategorías).
import ajustesJson from './data/ajustes.json';
import anunciosJson from './data/anunciantes.json';

// El panel omite los campos opcionales vacíos, así que se leen como opcionales
const ajustes = ajustesJson as Partial<Record<'autor' | 'cargo' | 'resumenAutor' | 'correoContacto' | 'formspreeId' | 'blogAnterior', string>>;
const anuncios = anunciosJson as {
  anunciosGratis?: boolean;
  huecos?: number;
  anunciantes?: { nombre?: string; descripcion?: string; enlace?: string; logo?: string }[];
};

export const SITE = {
  name: 'Rumbo Mercante',
  slogan: 'Recursos, herramientas y conocimiento operativo para el día a día de la gente de mar.',
  description:
    'Plantillas, checklists, guías técnicas, inglés marítimo y experiencia real a bordo para cadetes, pasantes y oficiales de la marina mercante.',
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

export const CATEGORIES: Category[] = [
  {
    id: 'recursos',
    subcategories: [
      { id: 'plantillas', name: 'Plantillas', description: 'Registros, formatos y hojas de cálculo listos para descargar y usar.' },
      { id: 'checklists', name: 'Checklists', description: 'Listas de verificación imprimibles para embarques, guardias y operaciones.' },
      { id: 'ingles-maritimo', name: 'Inglés marítimo', description: 'Glosarios y frases técnicas para comunicarte a bordo.' },
      { id: 'herramientas', name: 'Herramientas', description: 'Calculadoras y conversores interactivos que funcionan en el móvil.' },
    ],
    name: 'Recursos',
    short: 'Recursos',
    kicker: 'Plantillas · Checklists · Herramientas',
    description:
      'Material operativo listo para usar: plantillas, checklists imprimibles, glosarios de inglés técnico y calculadoras para el trabajo a bordo.',
    icon: 'toolbox',
    color: 'var(--c-recursos)',
  },
  {
    id: 'guias',
    subcategories: [
      { id: 'sala-de-maquinas', name: 'Sala de máquinas', description: 'Motores, auxiliares, combustible y el día a día del departamento de máquinas.' },
      { id: 'cubierta', name: 'Cubierta y navegación', description: 'Guardias de puente, maniobras y operaciones de cubierta.' },
      { id: 'seguridad', name: 'Seguridad', description: 'Procedimientos, permisos de trabajo, emergencias y prevención.' },
      { id: 'formacion', name: 'Formación y estudios', description: 'Cómo elegir especialidad, estudiar y prepararte para los exámenes.' },
    ],
    name: 'Guías y Operaciones',
    short: 'Guías',
    kicker: 'Sala de máquinas · Cubierta · Procedimientos',
    description:
      'Explicaciones claras del funcionamiento real de los sistemas a bordo y de los procedimientos que se aplican en cada guardia.',
    icon: 'compass',
    color: 'var(--c-guias)',
  },
  {
    id: 'vida-a-bordo',
    subcategories: [
      { id: 'primer-embarque', name: 'Primer embarque', description: 'Todo lo que necesitas saber antes y durante tus prácticas a bordo.' },
      { id: 'bienestar', name: 'Bienestar y fatiga', description: 'Descanso, salud, convivencia y vida lejos de casa.' },
      { id: 'carrera-profesional', name: 'Carrera profesional', description: 'Ascensos, títulos, tipos de buque y cómo crecer por mérito propio.' },
    ],
    name: 'Vida a Bordo y Desarrollo Profesional',
    short: 'Vida a Bordo',
    kicker: 'Embarques · Carrera · Bienestar',
    description:
      'Lo que no se enseña en la academia: primer embarque, fatiga, convivencia, ascensos y cómo trazar tu carrera por mérito propio.',
    icon: 'anchor',
    color: 'var(--c-vida)',
  },
  {
    id: 'actualidad',
    subcategories: [
      { id: 'normativa', name: 'Normativa', description: 'OMI, STCW, MARPOL, SOLAS y MLC explicados en la práctica.' },
      { id: 'industria', name: 'Industria', description: 'Tendencias del sector, combustibles, tecnología y empleo.' },
      { id: 'novedades', name: 'Novedades del sitio', description: 'Nuevos recursos, anuncios y novedades de Rumbo Mercante.' },
    ],
    name: 'Actualidad Marítima',
    short: 'Actualidad',
    kicker: 'Normativa · Industria · Novedades',
    description:
      'Novedades del sector, cambios normativos (OMI, STCW, MARPOL, MLC) y lo que significan en la práctica para la gente de mar.',
    icon: 'radar',
    color: 'var(--c-actualidad)',
  },
];

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
