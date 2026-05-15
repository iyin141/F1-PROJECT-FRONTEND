import "server-only";

import { BACKEND_API_URL } from "@/Lib/api/config";

// Hop-by-hop headers that must be stripped when proxying responses.
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
]);

/**
 * Core proxy handler.
 *
 * Strips `/api/proxy` from the incoming pathname, forwards the request to
 * `BACKEND_API_URL/api{suffix}`, and returns the backend response verbatim.
 *
 * Responsibilities:
 *  - Preserves the full incoming pathname suffix (including trailing slash)
 *  - Forwards all request headers except `host` and `content-length`
 *  - Adds `x-forwarded-host`, `x-forwarded-proto`, and `x-forwarded-for`
 *  - Forwards the request body for non-GET/HEAD methods
 *  - Strips hop-by-hop headers from the response
 *  - Returns 502 on any backend fetch failure
 *
 * The Next.js route file at `app/api/proxy/[[...slug]]/route.ts` is a thin
 * wrapper that simply re-exports this function for each HTTP method.
 */
export async function handleProxyRequest(
  request: Request,
  ctx?: PromiseLike<unknown>
): Promise<Response> {
  // ctx may be a Promise in some Next.js runtime versions — always await.
  if (ctx && typeof (ctx as PromiseLike<unknown>).then === "function") {
    await ctx;
  }

  const url = new URL(request.url);
  const incomingPath = url.pathname || "";
  // Strip only the /api/proxy prefix; preserve everything after (including trailing slash).
  const suffix = incomingPath.replace(/^\/api\/proxy/, "") || "/";
  const backendBase = BACKEND_API_URL.replace(/\/$/, "");
  const query = url.search || "";
  const target = `${backendBase}/api${suffix}${query}`;

  // Build forwarded headers — skip host and content-length.
  const headers = new Headers();
  for (const [key, value] of request.headers) {
    const k = key.toLowerCase();
    if (k === "host" || k === "content-length") continue;
    headers.set(key, value);
  }

  headers.set("x-forwarded-host", url.host || "");
  headers.set("x-forwarded-proto", url.protocol.replace(":", "") || "");
  if (!headers.has("x-forwarded-for")) {
    headers.set(
      "x-forwarded-for",
      request.headers.get("x-forwarded-for") || ""
    );
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "follow",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const ab = await request.arrayBuffer();
    if (ab.byteLength) init.body = ab;
  }

  console.log(`[proxy] ${request.method} ${target}`);

  let res: Response;
  try {
    res = await fetch(target, init);
  } catch (err) {
    console.error("[proxy] fetch failed", { target, err });
    return new Response("Bad Gateway", { status: 502 });
  }

  // Strip hop-by-hop headers before forwarding the response.
  const responseHeaders = new Headers();
  for (const [key, value] of res.headers) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  }

  console.log(`[proxy] -> ${res.status} ${target}`);

  return new Response(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}
