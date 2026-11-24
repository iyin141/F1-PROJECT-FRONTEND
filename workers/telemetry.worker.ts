/// <reference lib="webworker" />
/**
 * Columnar telemetry decoder (stub for phase U1c).
 * Fetches `telemetry/?format=columnar`, parses the JSON off the main thread and posts typed arrays back as
 * transferables, so React never sits in the redraw path. Request: {id, url}. Reply: {id, ok, columns | error}.
 * ponytail: no decimation or caching yet; U1c adds min/max per-pixel decimation and a lap cache.
 */
export type WorkerRequest = { id: number; url: string };
export type DecodedTelemetry = { driver: string; lap: number | null; rows: number; columns: Record<string, Float64Array> };
export type WorkerReply = { id: number; ok: true; result: DecodedTelemetry } | { id: number; ok: false; error: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, url } = e.data;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const data = body.data as Record<string, unknown[]>;
    const columns: Record<string, Float64Array> = {};
    for (const [k, v] of Object.entries(data)) {
      if (k === "driver_code") continue;
      // null -> NaN, boolean -> 0/1 so uPlot gets plain numbers
      columns[k] = Float64Array.from(v as (number | boolean | null)[], (x) => (x === null ? NaN : Number(x)));
    }
    const rows = columns.distance_m?.length ?? 0;
    const reply: WorkerReply = {
      id, ok: true,
      result: { driver: String(body.meta?.driver ?? ""), lap: (data.lap_number?.[0] as number | undefined) ?? null, rows, columns },
    };
    ctx.postMessage(reply, Object.values(columns).map((c) => c.buffer));
  } catch (err) {
    ctx.postMessage({ id, ok: false, error: err instanceof Error ? err.message : String(err) } satisfies WorkerReply);
  }
};
