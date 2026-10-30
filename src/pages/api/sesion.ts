import type { APIRoute } from 'astro';
import { verifySession } from '../../lib/oauth';

export const prerender = false;

// Comprueba si la sesión guardada en el navegador sigue siendo válida (200) o ha caducado (401).
export const GET: APIRoute = async ({ request }) => {
  const token = (request.headers.get('authorization') ?? '').replace(/^(token|bearer)\s+/i, '');
  const ok = await verifySession(token);
  return new Response(null, { status: ok ? 204 : 401, headers: { 'Cache-Control': 'no-store' } });
};
