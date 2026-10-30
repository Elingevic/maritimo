// Configuración del panel de administración (Sveltia CMS), generada en el build.
// Se construye a partir de src/config.ts para que las subcategorías del panel coincidan siempre con las del sitio.
// (El JSON es YAML válido, por eso se sirve como config.yml.)
import type { APIRoute } from 'astro';
import { CATEGORIES } from '../../config';

export const prerender = true;

const TYPES = [
  { label: 'Guía', value: 'guia' },
  { label: 'Checklist', value: 'checklist' },
  { label: 'Plantilla', value: 'plantilla' },
  { label: 'Glosario', value: 'glosario' },
  { label: 'Artículo', value: 'articulo' },
  { label: 'Noticia', value: 'noticia' },
];

const subcategoryOptions = CATEGORIES.flatMap((c) =>
  c.subcategories.map((s) => ({ label: `${c.short} › ${s.name}`, value: s.id })),
);

const buildConfig = (origin: string) => ({
  backend: {
    name: 'github',
    repo: 'Elingevic/maritimo',
    branch: process.env.CMS_BRANCH || 'main',
    // Acceso con usuario y contraseña (src/pages/api/auth.ts). El panel no habla con GitHub
    // directamente: pasa por /api/gh, que añade el token guardado en Vercel.
    base_url: origin,
    auth_endpoint: 'api/auth',
    auth_methods: ['oauth'],
    api_root: `${origin}/api/gh`,
    commit_messages: {
      create: 'Panel: crea {{collection}} "{{slug}}"',
      update: 'Panel: actualiza {{collection}} "{{slug}}"',
      delete: 'Panel: elimina {{collection}} "{{slug}}"',
      uploadMedia: 'Panel: sube "{{path}}"',
      deleteMedia: 'Panel: elimina "{{path}}"',
    },
  },
  site_url: origin,
  display_url: origin,
  logo: { src: '/favicon.svg' },
  media_folder: '/public/img/articulos',
  public_folder: '/img/articulos',
  // Las fotos se convierten a WebP y se reducen antes de subirlas: pesan menos y no superan
  // el límite de ~4,5 MB por petición de las funciones de Vercel (el archivo viaja en base64).
  media_libraries: {
    default: {
      config: {
        max_file_size: 3_000_000,
        transformations: {
          raster_image: { format: 'webp', quality: 82, width: 1920, height: 1920 },
          svg: { optimize: true },
        },
      },
    },
  },
  output: { omit_empty_optional_fields: true },
  slug: { encoding: 'ascii', clean_accents: true, sanitize_replacement: '-' },
  collections: [
    {
      name: 'articulos',
      label: 'Publicaciones',
      label_singular: 'publicación',
      description:
        'Artículos, guías, checklists, plantillas y noticias. Al guardar, la web se actualiza sola en 1-2 minutos.',
      folder: '/src/content/articulos',
      extension: 'md',
      format: 'frontmatter',
      create: true,
      delete: true,
      slug: '{{title}}',
      summary: '{{title}}',
      sortable_fields: ['title', { field: 'date', label: 'Fecha', default_sort: 'desc' }],
      view_filters: [
        { label: 'Borradores', field: 'draft', pattern: true },
        { label: 'Destacados en portada', field: 'featured', pattern: true },
        ...CATEGORIES.map((c) => ({
          label: c.short,
          field: 'subcategory',
          pattern: `^(${c.subcategories.map((s) => s.id).join('|')})$`,
        })),
      ],
      fields: [
        { name: 'title', label: 'Título', widget: 'string' },
        {
          name: 'description',
          label: 'Resumen',
          widget: 'text',
          hint: 'Una o dos frases. Aparece en las tarjetas y en Google.',
        },
        {
          name: 'subcategory',
          label: 'Sección › Subcategoría',
          widget: 'select',
          options: subcategoryOptions,
          hint: 'Define en qué sección y subcategoría aparece la publicación.',
        },
        { name: 'type', label: 'Tipo', widget: 'select', options: TYPES, default: 'articulo' },
        { name: 'date', label: 'Fecha de publicación', widget: 'datetime', type: 'date', default: '{{now}}' },
        {
          name: 'updated',
          label: 'Fecha de actualización',
          widget: 'datetime',
          type: 'date',
          required: false,
          hint: 'Opcional. Rellénala si actualizas un artículo antiguo.',
        },
        {
          name: 'featured',
          label: 'Destacado en portada',
          widget: 'boolean',
          default: false,
          hint: 'La portada muestra los 3 destacados más recientes.',
        },
        {
          name: 'draft',
          label: 'Borrador (no se publica)',
          widget: 'boolean',
          default: false,
          hint: 'Actívalo para guardar sin que aparezca en la web.',
        },
        { name: 'image', label: 'Imagen de portada', widget: 'image', required: false },
        {
          name: 'imageAlt',
          label: 'Descripción de la imagen',
          widget: 'string',
          required: false,
          hint: 'Qué se ve en la foto (accesibilidad y Google).',
        },
        { name: 'tags', label: 'Etiquetas', widget: 'list', required: false, hint: 'Separadas por comas.' },
        {
          name: 'printable',
          label: 'Mostrar botón "Imprimir / Guardar PDF"',
          widget: 'boolean',
          default: false,
          hint: 'Útil en checklists. Las casillas se escriben en el texto como "- [ ] tarea".',
        },
        {
          name: 'download',
          label: 'Archivo descargable',
          widget: 'file',
          required: false,
          media_folder: '/public/descargas',
          public_folder: '/descargas',
          hint: 'Opcional: Excel, PDF, Word, CSV…',
        },
        {
          name: 'downloadLabel',
          label: 'Texto del botón de descarga',
          widget: 'string',
          required: false,
          hint: 'Ej.: "Descargar plantilla (Excel)".',
        },
        { name: 'body', label: 'Contenido', widget: 'markdown' },
      ],
    },
    {
      name: 'paginas',
      label: 'Páginas y textos',
      description: 'Textos de la portada, las secciones y las páginas fijas de la web.',
      files: [
        {
          name: 'inicio',
          label: 'Portada (inicio)',
          file: '/src/data/inicio.json',
          media_folder: '/public/img',
          public_folder: '/img',
          fields: [
            { name: 'heroImagen', label: 'Imagen de fondo de la portada', widget: 'image', required: false, hint: 'Foto horizontal grande (buques, puerto…).' },
            { name: 'heroKicker', label: 'Texto pequeño sobre el título', widget: 'string', required: false },
            { name: 'heroTitulo', label: 'Título principal', widget: 'text' },
            { name: 'heroTituloDestacado', label: 'Final del título (en dorado y cursiva)', widget: 'string', required: false },
            { name: 'heroTexto', label: 'Texto bajo el título', widget: 'text', required: false },
            { name: 'heroBoton1', label: 'Botón 1 (lleva a las secciones)', widget: 'string' },
            { name: 'heroBoton2', label: 'Botón 2 (lleva a "Nosotros")', widget: 'string' },
            { name: 'seccionesKicker', label: 'Bloque Secciones · texto pequeño', widget: 'string', required: false },
            { name: 'seccionesTitulo', label: 'Bloque Secciones · título', widget: 'string' },
            { name: 'seccionesTexto', label: 'Bloque Secciones · texto', widget: 'text', required: false },
            { name: 'destacadosKicker', label: 'Bloque Destacados · texto pequeño', widget: 'string', required: false },
            { name: 'destacadosTitulo', label: 'Bloque Destacados · título', widget: 'string' },
            { name: 'ultimosKicker', label: 'Bloque Últimas publicaciones · texto pequeño', widget: 'string', required: false },
            { name: 'ultimosTitulo', label: 'Bloque Últimas publicaciones · título', widget: 'string' },
            { name: 'anunciantesKicker', label: 'Bloque Anunciantes · texto pequeño', widget: 'string', required: false },
            { name: 'anunciantesTitulo', label: 'Bloque Anunciantes · título', widget: 'string' },
            { name: 'anunciantesTexto', label: 'Bloque Anunciantes · texto', widget: 'text', required: false },
          ],
        },
        {
          name: 'secciones',
          label: 'Secciones y subcategorías',
          file: '/src/data/secciones.json',
          fields: [
            {
              name: 'secciones',
              label: 'Secciones',
              label_singular: 'sección',
              widget: 'list',
              allow_add: false,
              allow_remove: false,
              allow_reorder: false,
              summary: '{{fields.nombre}}',
              hint: 'Las 4 secciones son fijas: puedes cambiar sus textos y añadir, editar o quitar subcategorías.',
              fields: [
                { name: 'id', label: 'Identificador', widget: 'string', readonly: true },
                { name: 'nombre', label: 'Nombre', widget: 'string' },
                { name: 'corto', label: 'Nombre corto (menú)', widget: 'string' },
                { name: 'kicker', label: 'Texto pequeño', widget: 'string', required: false },
                { name: 'descripcion', label: 'Descripción', widget: 'text' },
                {
                  name: 'subcategorias',
                  label: 'Subcategorías',
                  label_singular: 'subcategoría',
                  widget: 'list',
                  summary: '{{fields.nombre}}',
                  fields: [
                    { name: 'nombre', label: 'Nombre', widget: 'string' },
                    { name: 'descripcion', label: 'Descripción', widget: 'text', required: false },
                    {
                      name: 'id',
                      label: 'Dirección web (opcional)',
                      widget: 'string',
                      required: false,
                      hint: 'Déjalo vacío en las nuevas: se crea solo a partir del nombre. No lo cambies en las que ya tienen publicaciones.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'nosotros',
          label: 'Nosotros',
          file: '/src/data/nosotros.md',
          media_folder: '/public/img',
          public_folder: '/img',
          fields: [
            { name: 'titulo', label: 'Título', widget: 'string' },
            { name: 'foto', label: 'Foto del autor', widget: 'image', required: false, hint: 'Mejor cuadrada. Si no hay foto, se muestran las iniciales.' },
            { name: 'datos', label: 'Datos de la ficha', widget: 'list', required: false, hint: 'Frases cortas: estudios, años, tipo de buque…' },
            { name: 'despedida', label: 'Frase de despedida', widget: 'string', required: false },
            { name: 'body', label: 'Texto', widget: 'markdown' },
          ],
        },
        {
          name: 'otras',
          label: 'Contacto, Anúnciate y Publicaciones',
          file: '/src/data/paginas.json',
          fields: [
            {
              name: 'contacto',
              label: 'Página Contacto',
              widget: 'object',
              fields: [
                { name: 'kicker', label: 'Texto pequeño', widget: 'string', required: false },
                { name: 'titulo', label: 'Título', widget: 'string' },
                { name: 'texto', label: 'Texto', widget: 'text', required: false },
                { name: 'consejo', label: 'Consejo (recuadro lateral)', widget: 'text', required: false },
              ],
            },
            {
              name: 'anunciate',
              label: 'Página Anúnciate',
              widget: 'object',
              fields: [
                { name: 'kicker', label: 'Texto pequeño', widget: 'string', required: false },
                { name: 'titulo', label: 'Título', widget: 'string' },
                { name: 'texto', label: 'Texto', widget: 'text', required: false },
                { name: 'condiciones', label: 'Condiciones', widget: 'text', required: false },
              ],
            },
            {
              name: 'publicaciones',
              label: 'Página Todas las publicaciones',
              widget: 'object',
              fields: [
                { name: 'kicker', label: 'Texto pequeño', widget: 'string', required: false },
                { name: 'titulo', label: 'Título', widget: 'string' },
                { name: 'texto', label: 'Texto', widget: 'text', required: false },
              ],
            },
          ],
        },
        {
          name: 'privacidad',
          label: 'Política de privacidad',
          file: '/src/data/privacidad.md',
          fields: [
            { name: 'titulo', label: 'Título', widget: 'string' },
            { name: 'actualizado', label: 'Última actualización', widget: 'string', required: false, hint: 'Ej.: 29 de octubre de 2026' },
            { name: 'body', label: 'Texto', widget: 'markdown' },
          ],
        },
        {
          name: 'terminos',
          label: 'Términos de uso',
          file: '/src/data/terminos.md',
          fields: [
            { name: 'titulo', label: 'Título', widget: 'string' },
            { name: 'actualizado', label: 'Última actualización', widget: 'string', required: false, hint: 'Ej.: 29 de octubre de 2026' },
            { name: 'body', label: 'Texto', widget: 'markdown' },
          ],
        },
      ],
    },
    {
      name: 'ajustes',
      label: 'Ajustes',
      description: 'Nombre de la web, autor, contacto, pie de página y anunciantes.',
      files: [
        {
          name: 'general',
          label: 'Datos generales',
          file: '/src/data/ajustes.json',
          fields: [
            { name: 'nombre', label: 'Nombre de la web', widget: 'string' },
            { name: 'eslogan', label: 'Eslogan', widget: 'text', hint: 'Sale en el pie de página y en el título de Google.' },
            { name: 'descripcion', label: 'Descripción para Google', widget: 'text' },
            { name: 'fraseFooter', label: 'Frase del pie de página', widget: 'string', required: false },
            { name: 'lemaFooter', label: 'Texto pequeño del pie de página', widget: 'string', required: false },
            { name: 'autor', label: 'Nombre del autor', widget: 'string' },
            { name: 'cargo', label: 'Cargo', widget: 'string' },
            {
              name: 'resumenAutor',
              label: 'Resumen del autor',
              widget: 'text',
              hint: 'Aparece en la ficha de autor junto a cada artículo.',
            },
            {
              name: 'correoContacto',
              label: 'Correo de contacto',
              widget: 'string',
              pattern: ['^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', 'Escribe un correo válido'],
              hint: 'Recibe los mensajes del formulario de contacto.',
            },
            {
              name: 'formspreeId',
              label: 'ID de Formspree (opcional)',
              widget: 'string',
              required: false,
              hint: 'Si lo rellenas, los mensajes llegan sin que el visitante abra su correo. Se obtiene gratis en formspree.io.',
            },
            { name: 'blogAnterior', label: 'Enlace al blog anterior', widget: 'string' },
          ],
        },
        {
          name: 'anunciantes',
          label: 'Anunciantes',
          file: '/src/data/anunciantes.json',
          media_folder: '/public/anunciantes',
          public_folder: '/anunciantes',
          fields: [
            {
              name: 'anunciosGratis',
              label: 'Mostrar aviso "Anúnciate gratis"',
              widget: 'boolean',
              default: true,
              hint: 'Desactívalo cuando la publicidad pase a ser de pago.',
            },
            {
              name: 'huecos',
              label: 'Número de huecos en la portada',
              widget: 'number',
              value_type: 'int',
              min: 1,
              max: 12,
              default: 4,
              hint: 'Los huecos sin anunciante muestran "Tu marca aquí".',
            },
            {
              name: 'anunciantes',
              label: 'Anunciantes',
              label_singular: 'anunciante',
              widget: 'list',
              required: false,
              summary: '{{fields.nombre}}',
              fields: [
                { name: 'nombre', label: 'Nombre', widget: 'string' },
                { name: 'descripcion', label: 'Frase descriptiva', widget: 'string', required: false },
                { name: 'enlace', label: 'Enlace (web del anunciante)', widget: 'string', hint: 'Empieza por https://' },
                { name: 'logo', label: 'Logo', widget: 'image', required: false },
              ],
            },
          ],
        },
      ],
    },
  ],
});

// En producción el origen es `site` (astro.config.mjs); en desarrollo, localhost.
export const GET: APIRoute = ({ url }) =>
  new Response(JSON.stringify(buildConfig(url.origin), null, 2), {
    headers: { 'Content-Type': 'text/yaml; charset=utf-8' },
  });
