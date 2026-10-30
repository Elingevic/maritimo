import type { APIRoute } from 'astro';
import { CSRF_COOKIE, getCredentials, outputHTML } from '../../lib/oauth';

export const prerender = false;

// Paso 2: GitHub vuelve aquí con un código que se canjea por el token de acceso.
export const GET: APIRoute = async ({ url, cookies }) => {
  const creds = getCredentials();
  if (!creds) {
    return outputHTML(url.origin, { error: 'Inicio de sesión con GitHub no configurado.', errorCode: 'MISCONFIGURED_CLIENT' });
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expected = cookies.get(CSRF_COOKIE)?.value;
  if (url.searchParams.get('error')) {
    return outputHTML(url.origin, {
      error: url.searchParams.get('error_description') ?? 'Acceso cancelado.',
      errorCode: 'AUTH_DENIED',
    });
  }
  if (!code || !state) {
    return outputHTML(url.origin, { error: 'Faltan parámetros en la respuesta de GitHub.', errorCode: 'AUTH_CODE_REQUEST_FAILED' }, 400);
  }
  if (!expected || state !== expected) {
    return outputHTML(url.origin, { error: 'La sesión de acceso caducó. Inténtalo de nuevo.', errorCode: 'CSRF_DETECTED' }, 400);
  }

  let token: string | undefined;
  let error: string | undefined;
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        code,
        redirect_uri: `${url.origin}/api/callback`,
      }),
    });
    ({ access_token: token, error_description: error } = await res.json());
  } catch {
    error = 'No se pudo contactar con GitHub. Inténtalo más tarde.';
  }

  if (!token) {
    return outputHTML(url.origin, { error: error ?? 'GitHub no devolvió un token.', errorCode: 'TOKEN_REQUEST_FAILED' });
  }
  return outputHTML(url.origin, { token });
};
