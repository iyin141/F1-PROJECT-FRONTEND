import type { DecodedTelemetry, WorkerReply } from "@/workers/telemetry.worker";
import { withQuery } from "./client";
import type { TelemetryParams } from "./payloads";

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, { resolve: (v: DecodedTelemetry) => void; reject: (e: Error) => void }>();

function get(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("../../../workers/telemetry.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (e: MessageEvent<WorkerReply>) => {
    const p = pending.get(e.data.id);
    if (!p) return;
    pending.delete(e.data.id);
    if (e.data.ok) p.resolve(e.data.result);
    else p.reject(new Error(e.data.error));
  };
  return worker;
}

/** Fetch and decode one driver/lap of columnar telemetry in the worker. Browser only. */
export function loadTelemetry(year: number, round: number, p: TelemetryParams): Promise<DecodedTelemetry> {
  const url = withQuery(`/api/analysis/races/${year}/${round}/telemetry/`, { ...p, format: "columnar" });
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    get().postMessage({ id, url });
  });
}
