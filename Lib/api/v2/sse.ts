import type { AskBody, AssistantEvent } from "./payloads";

/** Parse an SSE byte stream into events. Handles frames split across chunks and `: keepalive` comments. */
export async function* parseSse(body: ReadableStream<Uint8Array>): AsyncGenerator<AssistantEvent> {
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
      const data = frame.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trimStart()).join("\n");
      if (data) yield JSON.parse(data) as AssistantEvent;
    }
  }
}

/** POST /api/assistant/ask and iterate its events. EventSource cannot POST, hence fetch + stream. */
export async function* ask(body: AskBody, signal?: AbortSignal): AsyncGenerator<AssistantEvent> {
  const res = await fetch("/api/assistant/ask", {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "text/event-stream" }, body: JSON.stringify(body), signal,
  });
  if (!res.ok || !res.body) throw new Error(`Ask failed (${res.status})`);
  yield* parseSse(res.body);
}

/** Reconnect to a question already asked; the server replays from the start. */
export async function* reconnect(taskKey: string, signal?: AbortSignal): AsyncGenerator<AssistantEvent> {
  const res = await fetch(`/api/assistant/ask/${encodeURIComponent(taskKey)}/events`, { headers: { Accept: "text/event-stream" }, signal });
  if (!res.ok || !res.body) throw new Error(`Reconnect failed (${res.status})`);
  yield* parseSse(res.body);
}
