/**
 * Mock SSE for /api/assistant/ask. Same event contract as A3 (status, token, citations, done | error), same
 * `[E1]` citation markers and `E1` evidence ids, frame ids = sequence numbers, so reconnect with Last-Event-ID works.
 * The question text picks a scenario so every UI state can be driven without a backend:
 *   "banana" or "notfound" -> Evidence not found;  "drop" -> the stream closes mid-answer (reconnect test);
 *   "ratelimit" / "authexpired" / "llmfailed" / "timeout" -> error event;  "longquote" -> done with long_quotes.
 */
import type { AssistantCitation, AssistantEvent } from "@/Lib/api/v2/payloads";

export type Mode = "normal" | "notfound" | "drop" | "ratelimit" | "authexpired" | "llmfailed" | "timeout" | "longquote";

export function modeOf(text: string): Mode {
  const t = text.toLowerCase();
  if (/banana|notfound/.test(t)) return "notfound";
  for (const m of ["drop", "ratelimit", "authexpired", "llmfailed", "timeout", "longquote"] as const) if (t.includes(m)) return m;
  return "normal";
}

const CITES: AssistantCitation[] = [
  {
    id: "E1", n: 1, kind: "document", label: "Mock Sporting Regulations, Art. 33.4", title: "MOCK FIXTURE: Sporting Regulations (not real text)",
    url: "https://www.fia.com/", page: 41, article: "33.4", section: "Safety car", year: 2024, race: null, doc_type: "regulation",
    extract: "MOCK TEXT. Placeholder wording for the fixture: the article body would appear here, and the side panel highlights it as the evidence the answer rests on.",
  },
  {
    id: "E2", n: 2, kind: "document", label: "Mock stewards decision, doc 12", title: "MOCK FIXTURE: Decision document (not real text)",
    url: "https://www.fia.com/", page: 2, article: null, section: "Decision", year: 2024, race: "Mock Grand Prix", doc_type: "decision",
    extract: "MOCK TEXT. Placeholder decision extract: a five-second time penalty for causing a collision, with the stewards' reasoning.",
  },
];

const ANSWER = "Based on the documents, the procedure is set out in Article 33.4 [E1]. A comparable past decision applied a five-second time penalty for causing a collision [E2, E1]. This is mock data, not a real regulation or ruling.";

const ERRORS: Record<string, { code: "auth_expired" | "rate_limited" | "llm_failed" | "timeout"; message: string }> = {
  ratelimit: { code: "rate_limited", message: "The assistant hit its usage limit; try again later." },
  authexpired: { code: "auth_expired", message: "The assistant's Claude login has expired; the operator must renew it." },
  llmfailed: { code: "llm_failed", message: "The assistant could not produce an answer." },
  timeout: { code: "timeout", message: "The assistant took too long; try again." },
};

/** Full event list for a scenario. `delay` is the pause before each event. */
export function askEvents(mode: Mode): { delay: number; ev: AssistantEvent }[] {
  const key = `ask-mock-${mode}`;
  const out: { delay: number; ev: AssistantEvent }[] = [
    { delay: 0, ev: { type: "status", phase: "queued", message: "Queued", task_key: key } },
    { delay: 250, ev: { type: "status", phase: "searching", message: "Searching regulations and decisions" } },
    { delay: 600, ev: { type: "status", phase: "solving", message: "Reading the evidence" } },
  ];
  if (mode in ERRORS) {
    out.push({ delay: 400, ev: { type: "error", ...ERRORS[mode] } });
    return out;
  }
  out.push({ delay: 500, ev: { type: "status", phase: "composing", message: "Writing the answer" } });
  if (mode === "notfound") {
    out.push({ delay: 120, ev: { type: "token", text: "Evidence not found." } }, { delay: 50, ev: { type: "citations", citations: [] } });
    out.push({ delay: 50, ev: { type: "done", rounds: 2, tools_used: ["search_documents", "search_race_data"], evidence_items: 0, not_found: true, grounded: true, citations: 0, invalid_citations: [], long_quotes: 0, cost_usd: 0.0123 } });
    return out;
  }
  for (const w of ANSWER.match(/\S+\s*/g) ?? []) out.push({ delay: 45, ev: { type: "token", text: w } });
  out.push({ delay: 80, ev: { type: "citations", citations: CITES } });
  out.push({ delay: 40, ev: { type: "done", rounds: 2, tools_used: ["search_documents"], evidence_items: 2, grounded: true, citations: 2, invalid_citations: [], long_quotes: mode === "longquote" ? 1 : 0, cost_usd: 0.0187 } });
  return out;
}

/**
 * Stream events as SSE frames. `start` is the first sequence number to send (frame ids are positions in the full
 * list, so a reconnect with Last-Event-ID n passes n + 1). `dropAfter` closes the stream early without a terminal event.
 */
export function sseStream(events: { delay: number; ev: AssistantEvent }[], signal?: AbortSignal, start = 0, dropAfter?: number): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    async start(ctl) {
      for (let seq = start; seq < events.length; seq++) {
        if (signal?.aborted) break;
        if (dropAfter !== undefined && seq >= dropAfter) break;
        await new Promise((r) => setTimeout(r, events[seq].delay));
        ctl.enqueue(enc.encode(`id: ${seq}\nevent: ${events[seq].ev.type}\ndata: ${JSON.stringify(events[seq].ev)}\n\n`));
      }
      ctl.close();
    },
  });
}
