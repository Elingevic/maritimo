// Acceso al panel (/admin/) con usuario y contraseña, sin cuenta de GitHub para el editor.
//
// Cómo funciona:
//  1. El panel abre /api/auth en una ventana emergente. Ahí se pide usuario y contraseña.
//  2. Si son correctos, se entrega al panel una "sesión" firmada (no el token de GitHub).
//  3. El panel habla con /api/gh/..., que comprueba la sesión y reenvía la petición a GitHub
//     usando el token guardado en Vercel (GITHUB_TOKEN). El token nunca llega al navegador.
//
// Variables de entorno en Vercel:
//  - GITHUB_TOKEN (obligatoria): token de GitHub con permiso de escritura en el repositorio.
//  - ADMIN_USER / ADMIN_PASSWORD (opcionales): por defecto "admin" / "admin".

const SESSION_DAYS = 30;
const encoder = new TextEncoder();

export function getConfig() {
  return {
    githubToken: process.env.GITHUB_TOKEN?.trim() || '',
    user: process.env.ADMIN_USER?.trim() || 'admin',
    password: process.env.ADMIN_PASSWORD ?? 'admin',
  };
}

const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

// La clave depende del token y de las credenciales: si cambias la contraseña, las sesiones abiertas caducan.
async function signingKey() {
  const { githubToken, user, password } = getConfig();
  const material = await crypto.subtle.digest('SHA-256', encoder.encode(`${githubToken}|${user}|${password}`));
  return crypto.subtle.importKey('raw', material, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createSession() {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const sig = await crypto.subtle.sign('HMAC', await signingKey(), encoder.encode(`rm1.${expires}`));
  return `rm1.${expires}.${toHex(sig)}`;
}

export async function verifySession(token: string | null | undefined) {
  if (!token) return false;
  const [v, expires, sig] = token.split('.');
  if (v !== 'rm1' || !expires || !sig || Number(expires) < Date.now()) return false;
  const bytes = sig.match(/.{2}/g)?.map((h) => parseInt(h, 16));
  if (!bytes || bytes.length !== 32 || bytes.some(Number.isNaN)) return false;
  return crypto.subtle.verify('HMAC', await signingKey(), new Uint8Array(bytes), encoder.encode(`rm1.${expires}`));
}

// Comparación en tiempo constante para no filtrar información por el tiempo de respuesta
export async function safeEqual(a: string, b: string) {
  const [ha, hb] = await Promise.all([a, b].map((s) => crypto.subtle.digest('SHA-256', encoder.encode(s))));
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

const escapeForScript = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const page = (body: string, script = '') => `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Acceso · Rumbo Mercante</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:1.5rem;
font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:#0a1a2f;color:#142133}
.box{width:100%;max-width:360px;background:#fbf9f4;border-radius:16px;padding:2rem 1.75rem;box-shadow:0 20px 50px rgba(0,0,0,.35)}
.brand{display:flex;align-items:center;gap:.6rem;margin-bottom:1.5rem}.brand img{width:40px;height:40px}
.brand b{font-family:Georgia,serif;font-size:1.3rem;color:#0a1a2f}.brand i{color:#9c7426}
h1{font-size:1.1rem;margin:0 0 1.25rem;color:#0a1a2f}label{display:block;font-size:.85rem;font-weight:600;margin:0 0 .35rem;color:#0f2540}
input{width:100%;font:inherit;font-size:1rem;padding:.75rem .9rem;border:1px solid #e8e0cf;border-radius:8px;background:#fff;margin-bottom:1rem}
input:focus{outline:none;border-color:#2a6496;box-shadow:0 0 0 3px rgba(42,100,150,.15)}
button{width:100%;font:inherit;font-weight:600;padding:.85rem;border:0;border-radius:999px;background:#c99a3c;color:#06111f;cursor:pointer;margin-top:.25rem}
button:hover{background:#e5c07b}.err{background:#fbf0ea;border:1px solid #f0d2c4;color:#8a3520;padding:.7rem .9rem;border-radius:8px;font-size:.9rem;margin-bottom:1rem}
.ok{text-align:center;color:#2f8a5b;font-weight:600}
</style></head><body><main class="box">
<div class="brand"><img src="/favicon.svg" alt=""><b>Rumbo <i>Mercante</i></b></div>
${body}</main>${script}</body></html>`;

export function loginForm(error?: string, status = 200) {
  const html = page(`<h1>Acceso al panel</h1>
${error ? `<p class="err" role="alert">${escapeHtml(error)}</p>` : ''}
<form method="POST" action="/api/auth">
<label for="u">Usuario</label><input id="u" name="usuario" autocomplete="username" required autofocus>
<label for="p">Contraseña</label><input id="p" name="clave" type="password" autocomplete="current-password" required>
<button type="submit">Entrar</button>
</form>`);
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY' },
  });
}

/**
 * Devuelve la sesión a la ventana del panel con el protocolo de mensajes de Decap/Sveltia:
 * la ventana emergente anuncia "authorizing:github" y responde solo al panel servido desde este dominio.
 */
export function outputHTML(origin: string, result: { token: string } | { error: string; errorCode?: string }) {
  const state = 'token' in result ? 'success' : 'error';
  const message = `authorization:github:${state}:${JSON.stringify({ provider: 'github', ...result })}`;
  const html = page(
    state === 'success'
      ? '<p class="ok">Acceso concedido. Volviendo al panel…</p>'
      : `<p class="err">${escapeHtml('error' in result ? result.error : '')}</p>`,
    `<script>
(() => {
  const allowed = ${escapeForScript(origin)};
  const message = ${escapeForScript(message)};
  window.addEventListener('message', (e) => {
    if (e.data !== 'authorizing:github' || e.origin !== allowed) return;
    window.opener && window.opener.postMessage(message, e.origin);
  });
  window.opener && window.opener.postMessage('authorizing:github', allowed);
})();
</script>`,
  );
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY' },
  });
}
