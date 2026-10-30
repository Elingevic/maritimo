# Rumbo Mercante

> Recursos, herramientas y conocimiento operativo para el día a día de la gente de mar.

Sitio web hecho con [Astro](https://astro.build) y publicado en Vercel. El contenido se edita desde un panel en `/admin/`.

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
| Panel de administración | `/admin/` |

## Panel de administración (`/admin/`)

El contenido se edita desde **https://maritimo-pi.vercel.app/admin/** con [Sveltia CMS](https://sveltiacms.app). Cada cambio guardado se convierte en un commit en `main` y Vercel republica la web sola. La guía para el editor está en **[GUIA-PANEL.md](GUIA-PANEL.md)**.

| Qué se edita en el panel | Archivo |
|---|---|
| Publicaciones | `src/content/articulos/*.md` (imágenes en `public/img/articulos/`, descargas en `public/descargas/`) |
| Autor, cargo, correo de contacto, Formspree | `src/data/ajustes.json` |
| Anunciantes (logos en `public/anunciantes/`) | `src/data/anunciantes.json` |
| Página "Nosotros" | `src/data/nosotros.md` |

La configuración del panel se **genera en el build** desde `src/pages/admin/config.yml.ts`, a partir de las secciones y subcategorías de `src/config.ts`. Si añades una subcategoría ahí, aparece sola en el panel.

### Dar acceso a un editor

1. El editor necesita una cuenta de GitHub.
2. En GitHub, ve a **maritimo → Settings → Collaborators → Add people** y añade su usuario (rol *Write*).
3. Con eso ya puede entrar con **"Iniciar sesión con un token de acceso"**.

### Activar el botón "Iniciar sesión con GitHub" (recomendado)

Es más cómodo que el token. Se configura una sola vez:

1. En GitHub, ve a **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - *Application name*: `Rumbo Mercante CMS`
   - *Homepage URL*: `https://maritimo-pi.vercel.app`
   - *Authorization callback URL*: `https://maritimo-pi.vercel.app/api/callback`
2. Copia el **Client ID** y genera un **Client secret**.
3. En Vercel, abre el proyecto y ve a **Settings → Environment Variables**. Añade `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET` (entorno *Production*).
4. Vuelve a desplegar (**Deployments → ⋯ → Redeploy**).

Las funciones que gestionan el inicio de sesión están en `src/pages/api/auth.ts` y `src/pages/api/callback.ts` (por eso el proyecto usa el adaptador `@astrojs/vercel`; el resto del sitio es estático).

> Si cambias de dominio, actualiza `site` en `astro.config.mjs`, `base_url` y `site_url` en `src/pages/admin/config.yml.ts` y la *callback URL* de la OAuth App.

## Publicar un artículo a mano (sin panel)

Crea un `.md` en `src/content/articulos/`. El nombre del archivo es la URL. La sección se deduce de la subcategoría.

```md
---
title: 'Título del artículo'
description: 'Resumen de una o dos frases.'
subcategory: sala-de-maquinas  # una de las subcategorías de src/config.ts
type: guia                     # guia | checklist | plantilla | glosario | articulo | noticia
date: 2026-11-05
tags: [motor, mantenimiento]
featured: false                # true = "Destacados" de la portada (los 3 más recientes)
printable: false               # true = botón "Imprimir / Guardar PDF"
# image: /img/articulos/foto.jpg
# download: /descargas/archivo.xlsx
# draft: true
---

Texto en Markdown. Las casillas se escriben así:
- [ ] Tarea
```

## Secciones y subcategorías

Están en `CATEGORIES`, dentro de `src/config.ts`. Los `id` de las subcategorías deben ser únicos en todo el sitio, porque de ellos se deduce la sección de cada artículo.

## Formulario de contacto

Sin Formspree, el formulario abre el programa de correo del visitante con el mensaje redactado y dirigido al correo de contacto. Con un ID de [Formspree](https://formspree.io), configurable desde el panel, los mensajes llegan directamente.

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera .vercel/output (formato de Vercel)
```

## Despliegue en Vercel

1. Entra en [vercel.com](https://vercel.com) con la cuenta de GitHub.
2. **Add New → Project** → importa el repositorio `maritimo`.
3. Vercel detecta Astro automáticamente. Pulsa **Deploy**.
4. Cuando tengas dominio propio, añádelo en Vercel y cambia `site` en `astro.config.mjs`.

## Créditos

Foto de portada: *CMA CGM Seine au port du Havre*, Wikimedia Commons, dominio público (CC0).
