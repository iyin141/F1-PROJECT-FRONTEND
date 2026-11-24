import { BACKEND_API_URL } from "@/Lib/api/config";
import { isMock } from "@/Lib/api/mode";
import { proxyToBackend } from "@/Lib/api/proxy";
import { askEvents, modeOf, sseStream, type Mode } from "@/Lib/mock/v2/assistant";

export const dynamic = "force-dynamic";

const SSE_HEADERS = { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" };
const DROP_AFTER = 12; // mock "drop" scenario: close the stream after this many events

type Ctx = { params: Promise<{ slug?: string[] }> };

/** Streams the backend's SSE body untouched and forces the no-buffering headers (the client sends Last-Event-ID on reconnect). */
async function forward(request: Request, slug: string[]) {
  if (isMock()) {
    if (request.method === "POST") {
      const question = String((await request.json().catch(() => ({})))?.question ?? "");
      const mode = modeOf(question);
      return new Response(sseStream(askEvents(mode), request.signal, 0, mode === "drop" ? DROP_AFTER : undefined), { headers: SSE_HEADERS });
    }
    // GET ask/<task_key>/events: task_key is `ask-mock-<mode>`; replay after Last-Event-ID
    const mode = (slug[1]?.replace("ask-mock-", "") ?? "normal") as Mode;
    const last = request.headers.get("Last-Event-ID");
    const start = last !== null && Number.isInteger(Number(last)) ? Number(last) + 1 : 0;
    return new Response(sseStream(askEvents(mode), request.signal, start), { headers: SSE_HEADERS });
  }
  const res = await proxyToBackend(request, `${BACKEND_API_URL}/api/assistant/${slug.join("/")}`);
  const headers = new Headers(res.headers);
  if (res.ok) for (const [k, v] of Object.entries(SSE_HEADERS)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}

// POST /api/assistant/ask  (no trailing slash: the backend route is `ask` and `ask/`)
export async function POST(request: Request, { params }: Ctx) {
  return forward(request, (await params).slug ?? []);
}
// GET /api/assistant/ask/<task_key>/events  (reconnect with Last-Event-ID)
export async function GET(request: Request, { params }: Ctx) {
  return forward(request, (await params).slug ?? []);
}
