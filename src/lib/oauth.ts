// Inicio de sesión con GitHub para el panel (/admin/), compatible con Sveltia CMS / Decap CMS.
// Requiere en Vercel las variables GITHUB_CLIENT_ID y GITHUB_CLIENT_SECRET de una OAuth App de GitHub
// cuya "Authorization callback URL" sea https://<dominio>/api/callback

export const CSRF_COOKIE = 'rm-oauth-state';

// Ámbitos que el panel puede pedir. `repo` es el predeterminado (permite escribir en repos privados).
const ALLOWED_SCOPES = ['repo', 'public_repo', 'user', 'read:user', 'user:email'];

export function pickScope(requested: string | null) {
  const scopes = (requested ?? '').split(/[\s,]+/).filter(Boolean);
  return scopes.length && scopes.every((s) => ALLOWED_SCOPES.includes(s)) ? scopes.join(' ') : 'repo';
}

const escapeForScript = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

/**
 * Página que devuelve el resultado a la ventana del panel mediante el protocolo de mensajes de Decap/Sveltia:
 * la ventana emergente anuncia "authorizing:github" y responde solo al panel servido desde este mismo dominio.
 */
export function outputHTML(
  origin: string,
  result: { token: string } | { error: string; errorCode?: string },
  status = 200,
) {
  const state = 'token' in result ? 'success' : 'error';
  const content = { provider: 'github', ...result };
  const message = `authorization:github:${state}:${JSON.stringify(content)}`;
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Rumbo Mercante · Acceso</title></head>
<body style="font-family:system-ui;padding:2rem;color:#142133">
<p>${state === 'success' ? 'Acceso concedido. Puedes cerrar esta ventana.' : 'No se pudo iniciar sesión. Cierra esta ventana e inténtalo de nuevo.'}</p>
<script>
(() => {
  const allowed = ${escapeForScript(origin)};
  const message = ${escapeForScript(message)};
  window.addEventListener('message', (e) => {
    if (e.data !== 'authorizing:github') return;
    // El token solo se entrega al panel alojado en este mismo dominio
    if (e.origin !== allowed) return;
    window.opener && window.opener.postMessage(message, e.origin);
  });
  window.opener && window.opener.postMessage('authorizing:github', allowed);
})();
</script></body></html>`;
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': `${CSRF_COOKIE}=; Path=/api; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

export function getCredentials() {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}
