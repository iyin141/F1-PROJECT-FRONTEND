import type { AskBody, AssistantEvent } from "./payloads";

export type SseFrame = { id: number | null; event: AssistantEvent };

/** Parse an SSE byte stream into frames (with their `id:`). Handles frames split across chunks and `: keepalive` comments. */
export async function* parseSse(body: ReadableStream<Uint8Array>): AsyncGenerator<SseFrame> {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i: number;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const frame = buf.slice(0, i);
      buf = buf.slice(i + 2);
      const lines = frame.split("\n");
      const data = lines.filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trimStart()).join("\n");
      const idLine = lines.find((l) => l.startsWith("id:"));
      if (data) yield { id: idLine ? Number(idLine.slice(3).trim()) : null, event: JSON.parse(data) as AssistantEvent };
    }
  }
}

const TERMINAL = new Set(["done", "error"]);
const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(t); reject(new DOMException("Aborted", "AbortError")); }, { once: true });
  });

export type AskOptions = { signal?: AbortSignal; maxReconnects?: number; onReconnect?: (attempt: number) => void };

/**
 * POST /api/assistant/ask and yield its events. EventSource cannot POST, hence fetch + stream.
 * If the stream ends or breaks before `done` or `error`, reconnect via
 * GET /api/assistant/ask/{task_key}/events with `Last-Event-ID` (the server resumes after that frame) up to
 * `maxReconnects` times, with a short backoff. Aborting the signal stops everything.
 */
export async function* ask(body: AskBody, opts: AskOptions = {}): AsyncGenerator<AssistantEvent> {
  const { signal, maxReconnects = 3, onReconnect } = opts;
  let taskKey: string | null = null;
  let lastId = -1;
  let finished = false;

  for (let attempt = 0; attempt <= maxReconnects && !finished; attempt++) {
    try {
      let res: Response;
      if (attempt === 0 || !taskKey) {
        if (attempt > 0) throw new Error("The connection dropped before the question was registered.");
        res = await fetch("/api/assistant/ask", {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "text/event-stream" }, body: JSON.stringify(body), signal,
        });
      } else {
        onReconnect?.(attempt);
        await sleep(400 * attempt, signal);
        res = await fetch(`/api/assistant/ask/${encodeURIComponent(taskKey)}/events`, {
          headers: { Accept: "text/event-stream", "Last-Event-ID": String(lastId) }, signal,
        });
      }
      if (!res.ok || !res.body) {
        if (res.status === 404 && attempt > 0) throw new Error("The answer expired on the server. Ask again.");
        throw new Error(`The assistant request failed (${res.status}).`);
      }
      for await (const { id, event } of parseSse(res.body)) {
        if (id !== null) lastId = id;
        if (event.type === "status" && event.task_key) taskKey = event.task_key;
        yield event;
        if (TERMINAL.has(event.type)) { finished = true; return; }
      }
      // stream ended without done or error: fall through and reconnect
    } catch (err) {
      if (signal?.aborted || (err instanceof DOMException && err.name === "AbortError")) throw err;
      if (attempt >= maxReconnects || !taskKey) throw err instanceof Error ? err : new Error(String(err));
    }
  }
  if (!finished) throw new Error("The connection kept dropping. Try again.");
}
