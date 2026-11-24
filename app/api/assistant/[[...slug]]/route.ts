import { BACKEND_API_URL } from "@/Lib/api/config";
import { isMock } from "@/Lib/api/mode";
import { proxyToBackend } from "@/Lib/api/proxy";
import { askEvents, sseStream } from "@/Lib/mock/v2/assistant";

export const dynamic = "force-dynamic";

const SSE_HEADERS = { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" };

type Ctx = { params: Promise<{ slug?: string[] }> };

/** Streams the backend's SSE body untouched and forces the no-buffering headers. */
async function forward(request: Request, slug: string[]) {
  const path = slug.join("/");
  if (isMock()) {
    let question = "";
    if (request.method === "POST") question = String((await request.json().catch(() => ({})))?.question ?? "");
    return new Response(sseStream(askEvents(question), request.signal), { headers: SSE_HEADERS });
  }
  const res = await proxyToBackend(request, `${BACKEND_API_URL}/api/assistant/${path}`);
  const headers = new Headers(res.headers);
  if (res.ok) for (const [k, v] of Object.entries(SSE_HEADERS)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}

// POST /api/assistant/ask  (no trailing slash: the backend route is `ask` and `ask/`)
export async function POST(request: Request, { params }: Ctx) {
  return forward(request, (await params).slug ?? []);
}
// GET /api/assistant/ask/<task_key>/events  (reconnect). The mock replays the same stream.
export async function GET(request: Request, { params }: Ctx) {
  return forward(request, (await params).slug ?? []);
}
