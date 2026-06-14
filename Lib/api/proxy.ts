import { BACKEND_API_URL } from "@/Lib/api/config";

export type ProxyOptions = {
  forceInternal?: boolean;
};

/**
 * Proxy a request to the backend API, injecting a server-only API key when
 * the client did not provide one. This keeps the internal key off the client.
 *
 * Debugging: set `PROXY_DEBUG=true` in your environment to log non-secret
 * diagnostics (boolean injectedKey, method, url, backend status, elapsed ms).
 */
export async function proxyToBackend(request: Request, backendUrl: string, opts: ProxyOptions = {}): Promise<Response> {
  const INTERNAL_KEY = process.env.BACKEND_INTERNAL_API_KEY ?? process.env.INTERNAL_API_KEY ?? "";
  const DEBUG = (process.env.PROXY_DEBUG ?? "").toLowerCase() === "true";

  const start = Date.now();

  const incoming = request.headers;
  const forward = new Headers();

  for (const [k, v] of incoming.entries()) {
    const key = k.toLowerCase();
    // Do not forward headers that would leak client-sensitive values
    if (key === "host" || key === "cookie" || key === "authorization" || key === "set-cookie") continue;
    if (key === "x-forwarded-for" || key === "x-real-ip" || key === "connection") continue;
    // Preserve other headers (content-type, accept, user-agent, etc.)
    forward.set(k, v);
  }

  const clientKey = incoming.get("x-api-key") || incoming.get("X-API-Key");
  const shouldInject = !!INTERNAL_KEY && !clientKey;

  if (opts.forceInternal) {
    if (INTERNAL_KEY) forward.set("x-api-key", INTERNAL_KEY);
  } else if (shouldInject) {
    forward.set("x-api-key", INTERNAL_KEY);
  }

  const init: RequestInit = {
    method: request.method,
    headers: forward,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const buf = await request.arrayBuffer();
      if (buf && (buf as ArrayBuffer).byteLength) init.body = buf;
    } catch (e) {
      // If body cannot be read, proceed without it (best-effort)
    }
  }

  // Perform the backend fetch and return a sanitized response
  const res = await fetch(backendUrl, init);
  const headers = new Headers(res.headers);
  // Remove headers that should not be exposed to browsers
  headers.delete("content-encoding");
  headers.delete("set-cookie");

  const elapsed = Date.now() - start;
  if (DEBUG) {
    try {
      // Log entirely non-secret facts only
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ injectedKey: !!(shouldInject || (opts.forceInternal && INTERNAL_KEY)), method: request.method, url: request.url, backendUrl, backendStatus: res.status, elapsedMs: elapsed }));
    } catch (e) {
      // ignore logging errors
    }
  }

  return new Response(res.body, { status: res.status, headers });
}

export default proxyToBackend;
