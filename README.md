# Rumbo Mercante

> Recursos, herramientas y conocimiento operativo para el día a día de la gente de mar.

Sitio web estático hecho con [Astro](https://astro.build). Se publica en Vercel sin configuración extra.

## Estructura del sitio

| Página | Ruta |
|---|---|
| Inicio (hero, secciones, destacados, últimos posts, anunciantes) | `/` |
| Sección | `/recursos/`, `/guias/`, `/vida-a-bordo/`, `/actualidad/` |
| Subcategoría | `/guias/sala-de-maquinas/` |
| Artículo | `/guias/sala-de-maquinas/nombre-del-articulo/` |
| Herramientas | `/recursos/herramientas/calculadora-descanso/`, `/recursos/herramientas/conversor-unidades/` |
| Todas las publicaciones | `/publicaciones/` |
| Nosotros, Contacto, Anúnciate | `/nosotros/`, `/contacto/`, `/anunciate/` |
| Legales | `/politica-de-privacidad/`, `/terminos/` |

## Cómo publicar un artículo nuevo

1. Crea un archivo `.md` en `src/content/articulos/`. El nombre del archivo será la URL (ej. `mi-articulo.md` → `/guias/sala-de-maquinas/mi-articulo/`).
2. Copia esta cabecera y rellénala:

```md
---
title: 'Título del artículo'
description: 'Resumen de una o dos frases (sale en las tarjetas y en Google).'
category: guias            # recursos | guias | vida-a-bordo | actualidad
subcategory: sala-de-maquinas  # una de las subcategorías de src/config.ts
type: guia                 # guia | checklist | plantilla | glosario | articulo | noticia
date: 2026-11-05
tags: [motor, mantenimiento]
featured: false            # true = aparece en "Destacados" de la portada (se muestran los 3 más recientes)
printable: false           # true = botón "Imprimir / Guardar PDF"
# download: /descargas/archivo.xlsx   # opcional: archivo en public/descargas/
# downloadLabel: 'Descargar plantilla'
# draft: true              # oculta el artículo hasta que esté listo
---

Aquí va el texto en Markdown.

## Un subtítulo

- Listas normales
- [ ] Casillas de checklist que el lector puede marcar
```

3. Guarda, haz commit y push. Vercel publica el cambio solo en un minuto.

## Cambiar secciones, subcategorías, textos y correo

Todo está en **`src/config.ts`**:

- `SITE`: nombre, eslogan, autor, correo de contacto (`contactEmail`) y `formspreeId`.
- `CATEGORIES`: las 4 secciones y sus **subcategorías**. Para añadir una subcategoría, agrega un objeto `{ id, name, description }`; su página se crea sola.
- `ADVERTISERS`: los anunciantes de la portada (ver abajo).

## Anunciantes

En `src/config.ts`:

```ts
export const ADVERTISERS: Advertiser[] = [
  { name: 'Academia Náutica X', description: 'Cursos STCW', href: 'https://...', logo: '/anunciantes/academia-x.png' },
];
export const AD_SLOTS = 4;     // número de huecos visibles (los vacíos dicen "Tu marca aquí")
export const ADS_FREE = true;  // pon false cuando pase a ser de pago (quita el aviso "Anúnciate gratis")
```

Sube los logos a `public/anunciantes/`.

## Formulario de contacto

Por defecto el formulario abre el programa de correo del visitante con el mensaje ya redactado, dirigido a `contactEmail`.
Para recibir los mensajes directamente sin que el visitante salga de la web:

1. Crea una cuenta gratuita en [formspree.io](https://formspree.io) y un formulario nuevo.
2. Copia el ID (ej. `xyzabcde`) en `formspreeId` dentro de `src/config.ts`.

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera la carpeta dist/
```

## Despliegue en Vercel

1. Entra en [vercel.com](https://vercel.com) con la cuenta de GitHub.
2. **Add New → Project** → importa el repositorio `maritimo`.
3. Vercel detecta Astro automáticamente. Pulsa **Deploy**.
4. Cuando tengas dominio propio, añádelo en Vercel y cambia `site` en `astro.config.mjs`.

## Créditos

Foto de portada: *CMA CGM Seine au port du Havre*, Wikimedia Commons, dominio público (CC0).
