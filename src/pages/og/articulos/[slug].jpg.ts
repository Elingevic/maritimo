// Imagen para compartir (WhatsApp, redes) de cada artículo con foto de portada:
// la foto recortada a 1200x630 con la franja de Rumbo Mercante abajo. Se genera al publicar.
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { getArticulos, type Articulo } from '../../../lib/utils';

export const prerender = true;

export async function getStaticPaths() {
  const all = await getArticulos();
  return all.filter((a) => a.data.image).map((a) => ({ params: { slug: a.id }, props: { article: a } }));
}

const W = 1200;
const H = 630;

export const GET: APIRoute = async ({ props }) => {
  const { article } = props as { article: Articulo };
  const root = process.cwd();
  const band = await fs.readFile(path.join(root, 'src/assets/og-banda.png'));
  let photo: Buffer;
  try {
    photo = await fs.readFile(path.join(root, 'public', article.data.image!.replace(/^\/+/, '')));
  } catch {
    // Si la foto no existe, se usa la imagen de la sección
    photo = await fs.readFile(path.join(root, 'public/og', `${article.data.category}.jpg`));
  }
  const jpg = await sharp(photo)
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .composite([{ input: band, gravity: 'south' }])
    .jpeg({ quality: 82, progressive: true })
    .toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
