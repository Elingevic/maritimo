import type { APIRoute } from 'astro';
import { getConfig, verifySession } from '../../../lib/oauth';

export const prerender = false;

// Intermediario entre el panel y la API de GitHub.
// El panel usa `api_root: <sitio>/api/gh`, así que llama a /api/gh/api/v3/... (REST) y /api/gh/api/graphql.
const FORWARD_REQUEST_HEADERS = ['accept', 'content-type', 'if-none-match', 'if-modified-since', 'x-github-api-version'];
const FORWARD_RESPONSE_HEADERS = ['content-type', 'etag', 'last-modified', 'link', 'x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset', 'x-ratelimit-used', 'x-github-request-id'];

const unauthorized = () =>
  new Response(JSON.stringify({ message: 'Bad credentials' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const ALL: APIRoute = async ({ request, params, url }) => {
  const { githubToken } = getConfig();
  if (!githubToken) {
    return new Response(JSON.stringify({ message: 'Falta GITHUB_TOKEN en Vercel' }), { status: 503 });
  }

  const auth = request.headers.get('authorization') ?? '';
  const session = auth.replace(/^(token|bearer)\s+/i, '');
  if (!(await verifySession(session))) return unauthorized();

  const path = params.path ?? '';
  let target: string;
  if (path === 'api/graphql') target = 'https://api.github.com/graphql';
  else if (path.startsWith('api/v3/')) target = `https://api.github.com/${path.slice('api/v3/'.length)}`;
  else return new Response('Not found', { status: 404 });

  const headers = new Headers({ Authorization: `Bearer ${githubToken}`, 'User-Agent': 'rumbo-mercante-cms' });
  for (const h of FORWARD_REQUEST_HEADERS) {
    const v = request.headers.get(h);
    if (v) headers.set(h, v);
  }

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const res = await fetch(target + url.search, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: 'follow',
  });

  // Los enlaces absolutos de GitHub (paginación, campos "url") se reescriben para pasar por aquí
  const proxyRoot = `${url.origin}/api/gh/api/v3/`;
  const rewrite = (text: string) => text.replaceAll('https://api.github.com/', proxyRoot);

  const out = new Headers({ 'Cache-Control': 'no-store' });
  for (const h of FORWARD_RESPONSE_HEADERS) {
    const v = res.headers.get(h);
    if (v) out.set(h, h === 'link' ? rewrite(v) : v);
  }
  if (res.status === 204 || res.status === 304) return new Response(null, { status: res.status, headers: out });

  const isJson = (res.headers.get('content-type') ?? '').includes('json');
  const body = isJson ? rewrite(await res.text()) : await res.arrayBuffer();
  return new Response(body, { status: res.status, headers: out });
};
