import type { APIRoute } from 'astro';
import { createSession, getConfig, loginForm, outputHTML, safeEqual } from '../../lib/oauth';

export const prerender = false;

// El panel abre esta página en una ventana emergente al pulsar el botón de acceso.
export const GET: APIRoute = () => {
  if (!getConfig().githubToken) {
    return loginForm('El panel aún no está conectado a GitHub: falta la variable GITHUB_TOKEN en Vercel.', 503);
  }
  return loginForm();
};

export const POST: APIRoute = async ({ request, url }) => {
  const cfg = getConfig();
  if (!cfg.githubToken) {
    return loginForm('El panel aún no está conectado a GitHub: falta la variable GITHUB_TOKEN en Vercel.', 503);
  }
  const form = await request.formData().catch(() => null);
  const usuario = String(form?.get('usuario') ?? '').trim();
  const clave = String(form?.get('clave') ?? '');

  const [okUser, okPass] = await Promise.all([safeEqual(usuario, cfg.user), safeEqual(clave, cfg.password)]);
  if (!okUser || !okPass) {
    // Pequeña espera para frenar intentos repetidos
    await new Promise((r) => setTimeout(r, 1200));
    return loginForm('Usuario o contraseña incorrectos.', 401);
  }
  return outputHTML(url.origin, { token: await createSession() });
};
