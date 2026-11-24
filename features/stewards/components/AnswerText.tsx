import type { AssistantCitation } from "@/Lib/api/v2/payloads";

const MARKER = /\[(E\d+(?:\s*,\s*E\d+)*)\]/g;

/**
 * Streamed answer text with [E1] or [E1, E2] markers turned into citation chips. Until the `citations` event arrives
 * (or for an id it does not contain) the marker stays plain muted text, so a chip is never a dead button.
 */
export function AnswerText({ text, citations, onOpen }: { text: string; citations: AssistantCitation[] | null; onOpen: (c: AssistantCitation) => void }) {
  const byId = new Map((citations ?? []).map((c) => [c.id, c]));
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(MARKER)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    for (const id of m[1].split(/\s*,\s*/)) {
      const c = byId.get(id);
      out.push(
        c ? (
          <button key={key++} type="button" className="f1-chip" onClick={() => onOpen(c)} aria-label={`Source ${c.n}: ${c.title}. Open details`}>
            {c.n}
          </button>
        ) : (
          <span key={key++} className="f1-chip-pending">[{id}]</span>
        ),
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{out}</p>;
}
