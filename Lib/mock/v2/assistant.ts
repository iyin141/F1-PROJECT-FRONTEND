/** Mock SSE for /api/assistant/ask: status -> token* -> citations -> done (or "Evidence not found."). */
import type { AssistantCitation, AssistantEvent } from "@/Lib/api/v2/payloads";

const CITES: AssistantCitation[] = [
  {
    id: "mock-reg-1", n: 1, kind: "regulation", label: "Mock Sporting Regulations, Art. 33.4", title: "MOCK FIXTURE: Sporting Regulations (not real text)",
    url: "https://www.fia.com/", page: 41, article: "33.4", section: "Safety car", year: 2024, race: null, doc_type: "regulation",
    extract: "MOCK TEXT. Placeholder wording for the fixture: the article body would appear here, highlighted in the side panel.",
  },
  {
    id: "mock-dec-1", n: 2, kind: "decision", label: "Mock stewards decision, doc 12", title: "MOCK FIXTURE: Decision document (not real text)",
    url: "https://www.fia.com/", page: 2, article: null, section: "Decision", year: 2024, race: "Mock Grand Prix", doc_type: "decision",
    extract: "MOCK TEXT. Placeholder decision extract: a five-second time penalty, with the stewards' reasoning.",
  },
];

const ANSWER = "Based on the documents, the safety car procedure is set out in Article 33.4 [mock-reg-1]. A comparable past decision applied a five-second penalty [mock-dec-1]. This is mock data.";

export function askEvents(question: string): { delay: number; ev: AssistantEvent }[] {
  const notFound = /banana|unknown|nothing/i.test(question);
  const out: { delay: number; ev: AssistantEvent }[] = [
    { delay: 0, ev: { type: "status", phase: "queued", message: "Queued", task_key: "ask-mock" } },
    { delay: 250, ev: { type: "status", phase: "searching", message: "Searching regulations and decisions" } },
    { delay: 600, ev: { type: "status", phase: "solving", message: "Reading the evidence" } },
    { delay: 500, ev: { type: "status", phase: "composing", message: "Writing the answer" } },
  ];
  if (notFound) {
    out.push({ delay: 120, ev: { type: "token", text: "Evidence not found." } }, { delay: 50, ev: { type: "citations", citations: [] } });
    out.push({ delay: 50, ev: { type: "done", rounds: 1, tools_used: ["search_documents"], evidence_items: 0, not_found: true, grounded: true, citations: 0, invalid_citations: [], long_quotes: 0, cost_usd: 0 } });
    return out;
  }
  for (const w of ANSWER.match(/\S+\s*/g) ?? []) out.push({ delay: 35, ev: { type: "token", text: w } });
  out.push({ delay: 80, ev: { type: "citations", citations: CITES } });
  out.push({ delay: 40, ev: { type: "done", rounds: 2, tools_used: ["search_documents"], evidence_items: 2, grounded: true, citations: 2, invalid_citations: [], long_quotes: 0, cost_usd: 0 } });
  return out;
}

export function sseStream(events: { delay: number; ev: AssistantEvent }[], signal?: AbortSignal): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    async start(ctl) {
      let seq = 0;
      for (const { delay, ev } of events) {
        if (signal?.aborted) break;
        await new Promise((r) => setTimeout(r, delay));
        ctl.enqueue(enc.encode(`id: ${seq++}\nevent: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`));
      }
      ctl.close();
    },
  });
}
