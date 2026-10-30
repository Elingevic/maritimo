import type { APIRoute } from 'astro';
import { createSession, getConfig, loginForm, outputHTML, safeEqual } from '../../lib/oauth';

export const prerender = false;

const NOT_CONFIGURED = 'El panel aún no está conectado: falta la variable GITHUB_TOKEN en Vercel.';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

// Ventana emergente de acceso (respaldo por si el panel muestra su propio botón de entrar).
export const GET: APIRoute = () => (getConfig().githubToken ? loginForm() : loginForm(NOT_CONFIGURED, 503));

// Comprueba usuario y contraseña. La pantalla de /admin/ pide JSON; la ventana emergente, HTML.
export const POST: APIRoute = async ({ request, url }) => {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const cfg = getConfig();
  if (!cfg.githubToken) return wantsJson ? json({ error: NOT_CONFIGURED }, 503) : loginForm(NOT_CONFIGURED, 503);

  const form = await request.formData().catch(() => null);
  const usuario = String(form?.get('usuario') ?? '').trim();
  const clave = String(form?.get('clave') ?? '');

  const [okUser, okPass] = await Promise.all([safeEqual(usuario, cfg.user), safeEqual(clave, cfg.password)]);
  if (!okUser || !okPass) {
    // Pequeña espera para frenar intentos repetidos
    await new Promise((r) => setTimeout(r, 1200));
    const msg = 'Usuario o contraseña incorrectos.';
    return wantsJson ? json({ error: msg }, 401) : loginForm(msg, 401);
  }

  const token = await createSession();
  return wantsJson ? json({ token }) : outputHTML(url.origin, { token });
};
