"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ask } from "@/Lib/api/v2/sse";
import type { AskBody, AssistantCitation, AssistantDone, AssistantPhase } from "@/Lib/api/v2/payloads";

export type TurnError = { code: string; message: string };
export type Turn = {
  id: number;
  body: AskBody;
  running: boolean;
  phase: AssistantPhase;
  statusMessage: string;
  text: string;
  citations: AssistantCitation[] | null;
  done: AssistantDone | null;
  error: TurnError | null;
  cancelled: boolean;
  reconnecting: number;
};

const fresh = (id: number, body: AskBody): Turn => ({
  id, body, running: true, phase: "queued", statusMessage: "Sending the question", text: "", citations: null, done: null, error: null, cancelled: false, reconnecting: 0,
});

/** Chat state for the stewards assistant: one turn per question, streamed in place. Tokens are batched per frame. */
export function useAsk() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const abort = useRef<AbortController | null>(null);
  const nextId = useRef(1);
  const buffer = useRef("");
  const raf = useRef(0);

  const patch = useCallback((id: number, f: (t: Turn) => Partial<Turn>) => setTurns((all) => all.map((t) => (t.id === id ? { ...t, ...f(t) } : t))), []);

  const run = useCallback(async (id: number, body: AskBody) => {
    const ctl = new AbortController();
    abort.current = ctl;
    buffer.current = "";
    const flush = () => {
      raf.current = 0;
      const chunk = buffer.current;
      buffer.current = "";
      if (chunk) patch(id, (t) => ({ text: t.text + chunk }));
    };
    try {
      for await (const ev of ask(body, { signal: ctl.signal, onReconnect: (n) => patch(id, () => ({ reconnecting: n })) })) {
        if (ev.type === "status") patch(id, () => ({ phase: ev.phase, statusMessage: ev.message, reconnecting: 0 }));
        else if (ev.type === "token") {
          buffer.current += ev.text;
          if (!raf.current) raf.current = requestAnimationFrame(flush);
        } else if (ev.type === "citations") {
          flush();
          patch(id, () => ({ citations: ev.citations }));
        } else if (ev.type === "done") {
          flush();
          const { type: _t, ...meta } = ev; // eslint-disable-line @typescript-eslint/no-unused-vars
          patch(id, () => ({ done: meta, running: false }));
        } else if (ev.type === "error") {
          flush();
          patch(id, () => ({ error: { code: ev.code, message: ev.message }, running: false }));
        }
      }
    } catch (err) {
      flush();
      if (ctl.signal.aborted) patch(id, () => ({ cancelled: true, running: false }));
      else patch(id, () => ({ error: { code: "network", message: err instanceof Error ? err.message : "The connection failed." }, running: false }));
    } finally {
      patch(id, () => ({ running: false }));
      if (abort.current === ctl) abort.current = null;
    }
  }, [patch]);

  const send = useCallback((body: AskBody) => {
    const id = nextId.current++;
    setTurns((all) => [...all, fresh(id, body)]);
    void run(id, body);
  }, [run]);

  /** Re-ask a failed or cancelled turn in place. */
  const retry = useCallback((id: number) => {
    setTurns((all) => all.map((t) => (t.id === id ? fresh(id, t.body) : t)));
    const t = turns.find((x) => x.id === id);
    if (t) void run(id, t.body);
  }, [run, turns]);

  const cancel = useCallback(() => abort.current?.abort(), []);
  useEffect(() => () => { abort.current?.abort(); cancelAnimationFrame(raf.current); }, []);

  return { turns, send, retry, cancel, busy: turns.some((t) => t.running) };
}
