import type { APIRoute } from 'astro';
import { CSRF_COOKIE, getCredentials, outputHTML, pickScope } from '../../lib/oauth';

export const prerender = false;

// Paso 1: el panel abre esta URL en una ventana emergente y se redirige a GitHub para autorizar.
export const GET: APIRoute = ({ url }) => {
  const creds = getCredentials();
  if (!creds) {
    return outputHTML(url.origin, {
      error:
        'El inicio de sesión con GitHub aún no está configurado en Vercel (faltan GITHUB_CLIENT_ID y GITHUB_CLIENT_SECRET). Usa "Iniciar sesión con token".',
      errorCode: 'MISCONFIGURED_CLIENT',
    });
  }
  const provider = url.searchParams.get('provider') ?? 'github';
  if (provider !== 'github') {
    return outputHTML(url.origin, { error: `Proveedor no soportado: ${provider}`, errorCode: 'UNSUPPORTED_BACKEND' });
  }

  const state = crypto.randomUUID().replaceAll('-', '');
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', creds.clientId);
  authorize.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
  authorize.searchParams.set('scope', pickScope(url.searchParams.get('scope')));
  authorize.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      'Cache-Control': 'no-store',
      'Set-Cookie': `${CSRF_COOKIE}=${state}; Path=/api; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
    },
  });
};
