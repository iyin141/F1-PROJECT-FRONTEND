import { BACKEND_API_URL } from '@/Lib/api/config';

export const dynamic = 'force-dynamic';

type ProxyContext = { params?: { slug?: string[] } };

async function handleProxy(request: Request, { params }: ProxyContext) {
  const slug = params?.slug ?? [];
  const path = slug.filter(Boolean).join('/');
  const backendBase = BACKEND_API_URL.replace(/\/$/, '');
  const url = new URL(request.url);
  const query = url.search || '';
  const target = `${backendBase}/api${path ? `/${path}` : ''}${query}`;

  const headers = new Headers();
  for (const [key, value] of request.headers) {
    const k = key.toLowerCase();
    if (k === 'host' || k === 'content-length') continue;
    headers.set(key, value);
  }

  headers.set('x-forwarded-host', url.host || '');
  headers.set('x-forwarded-proto', url.protocol.replace(':', '') || '');
  if (!headers.get('x-forwarded-for')) headers.set('x-forwarded-for', request.headers.get('x-forwarded-for') || '');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'follow',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const ab = await request.arrayBuffer();
    if (ab.byteLength) init.body = ab;
  }

  console.log(`[api/proxy] ${request.method} ${target}`);

  const res = await fetch(target, init);

  const responseHeaders = new Headers(res.headers);
  // Drop hop-by-hop headers that may cause issues when proxying
  responseHeaders.delete('connection');
  responseHeaders.delete('keep-alive');
  responseHeaders.delete('transfer-encoding');

  return new Response(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}

export const GET = (req: Request, ctx: ProxyContext) => handleProxy(req, ctx);
export const POST = (req: Request, ctx: ProxyContext) => handleProxy(req, ctx);
export const PUT = (req: Request, ctx: ProxyContext) => handleProxy(req, ctx);
export const PATCH = (req: Request, ctx: ProxyContext) => handleProxy(req, ctx);
export const DELETE = (req: Request, ctx: ProxyContext) => handleProxy(req, ctx);
export const OPTIONS = (req: Request, ctx: ProxyContext) => handleProxy(req, ctx);
export const HEAD = (req: Request, ctx: ProxyContext) => handleProxy(req, ctx);
