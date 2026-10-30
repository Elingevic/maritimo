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
| Portada | `src/data/inicio.json` |
| Secciones y subcategorías | `src/data/secciones.json` (icono y color de cada sección en `src/config.ts`) |
| Nosotros | `src/data/nosotros.md` |
| Contacto, Anúnciate, Publicaciones | `src/data/paginas.json` |
| Privacidad y Términos | `src/data/privacidad.md`, `src/data/terminos.md` |
| Nombre, eslogan, autor, contacto, pie | `src/data/ajustes.json` |
| Anunciantes (logos en `public/anunciantes/`) | `src/data/anunciantes.json` |

La configuración del panel se **genera en el build** desde `src/pages/admin/config.yml.ts`. Las opciones de subcategoría salen de `secciones.json`, así que una subcategoría creada en el panel aparece en el desplegable tras el siguiente despliegue. Un artículo cuya subcategoría ya no existe no rompe el build: se omite con un aviso en el registro.

### Acceso con usuario y contraseña

El editor **no necesita cuenta de GitHub**. En `/admin/` ve una pantalla propia de usuario y contraseña (por defecto `admin` / `admin`), y el servidor hace los cambios en GitHub con un token guardado en Vercel:

- `public/admin/index.html`: pantalla de acceso. Guarda la sesión donde Sveltia CMS la busca al arrancar (`sveltia-cms.user`), así el panel abre ya identificado.
- `src/pages/api/auth.ts`: comprueba usuario y contraseña. Entrega una sesión firmada que caduca a los 30 días. `src/pages/api/sesion.ts` comprueba si sigue siendo válida.
- `src/pages/api/gh/[...path].ts`: intermediario hacia la API de GitHub. Comprueba la sesión y añade el token. El token nunca llega al navegador.

**Configuración en Vercel** (*Settings → Environment Variables*, entorno *Production*, y después *Redeploy*):

| Variable | Valor |
|---|---|
| `GITHUB_TOKEN` | **Obligatoria.** Token *fine-grained* de GitHub: *Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token*. En *Repository access* elige **Only select repositories → maritimo** y en *Permissions → Contents* elige **Read and write**. |
| `ADMIN_USER` | Opcional. Por defecto `admin`. |
| `ADMIN_PASSWORD` | Opcional. Por defecto `admin`. **Cámbiala pronto**: cualquiera que la adivine puede editar la web. Al cambiarla se cierran las sesiones abiertas. |

Las fotos se convierten a WebP (máx. 1920 px) antes de subirse, con un tope de 3 MB por archivo, por el límite de 4,5 MB de las funciones de Vercel.

## Publicar un artículo a mano (sin panel)

Crea un `.md` en `src/content/articulos/`. El nombre del archivo es la URL. La sección se deduce de la subcategoría.

```md
---
title: 'Título del artículo'
description: 'Resumen de una o dos frases.'
subcategory: sala-de-maquinas  # una de las subcategorías de src/data/secciones.json
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

Sus textos están en `src/data/secciones.json` (editable desde el panel); `src/config.ts` les añade el icono y el color. Los `id` de las subcategorías deben ser únicos en todo el sitio, porque de ellos se deduce la sección de cada artículo.

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
