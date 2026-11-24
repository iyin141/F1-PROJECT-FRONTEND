import type {
  AskBody, ChaosPending, CircuitHistory, CircuitSummary, CircuitsSummary, ColumnarTelemetryResponse, DeltaResponse, DriverProfile, DriversChaos, LapsChaos,
  MiniSectorScheme, MiniSectorsResponse, ModelPage, Pending, RaceChaos, TelemetryParams, TrackMapResponse, ChaosTarget,
} from "./payloads";

/** Same-origin `/api/*` route handlers: they inject the API key server-side (or serve fixtures in mock mode). */
export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

export const isPending = (v: unknown): v is Pending =>
  typeof v === "object" && v !== null && (v as Pending).status === "pending" && "task_key" in v;

type Query = Record<string, string | number | boolean | undefined | null | (string | number)[]>;

export function withQuery(path: string, q?: Query): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(q ?? {})) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  const s = sp.toString();
  return s ? `${path}?${s}` : path;
}

export async function getJson<T>(path: string, q?: Query, signal?: AbortSignal): Promise<T> {
  const res = await fetch(withQuery(path, q), { headers: { Accept: "application/json" }, signal });
  const body = await res.json().catch(() => undefined);
  if (!res.ok) {
    const detail = (body as { detail?: string } | undefined)?.detail;
    throw new ApiError(res.status, detail ?? `Request failed (${res.status})`, body);
  }
  return body as T;
}

const race = (y: number, r: number) => `/api/analysis/races/${y}/${r}`;
/** Routes that answer 202 `{status: "pending"}` while a build is queued return `T | Pending`. */
type Maybe<T> = T | Pending;

export const api = {
  trackMap: (y: number, r: number, scheme: MiniSectorScheme = "distance", signal?: AbortSignal) =>
    getJson<TrackMapResponse>(`${race(y, r)}/track-map/`, { scheme }, signal),
  miniSectors: (y: number, r: number, p: { drivers: string[]; lap?: string | number; scheme?: MiniSectorScheme; session?: string }, signal?: AbortSignal) =>
    getJson<Maybe<MiniSectorsResponse>>(`${race(y, r)}/mini-sectors/`, { ...p }, signal),
  delta: (y: number, r: number, p: { ref: string; cmp: string; lap?: string | number; session?: string }, signal?: AbortSignal) =>
    getJson<Maybe<DeltaResponse>>(`${race(y, r)}/telemetry/delta/`, { ...p }, signal),
  /** Columnar telemetry. Decode in the worker (`Lib/api/v2/telemetryWorkerClient.ts`) for the lab; this is the plain fetch. */
  telemetry: (y: number, r: number, p: TelemetryParams, signal?: AbortSignal) =>
    getJson<ColumnarTelemetryResponse>(`${race(y, r)}/telemetry/`, { ...p, format: "columnar" }, signal),

  raceChaos: (y: number, r: number, model?: string) => getJson<RaceChaos | ChaosPending>(`/api/chaos/races/${y}/${r}/`, { model }),
  raceDrivers: (y: number, r: number, model?: string) => getJson<DriversChaos | ChaosPending>(`/api/chaos/races/${y}/${r}/drivers/`, { model }),
  raceLaps: (y: number, r: number, target?: ChaosTarget, model?: string) =>
    getJson<LapsChaos | ChaosPending>(`/api/chaos/races/${y}/${r}/laps/`, { target, model }),
  circuits: () => getJson<CircuitSummary[]>(`/api/chaos/circuits/`),
  circuitsSummary: () => getJson<CircuitsSummary>(`/api/chaos/circuits/summary/`),
  circuitHistory: (slug: string) => getJson<CircuitHistory>(`/api/chaos/circuits/${encodeURIComponent(slug)}/history/`),
  driverProfile: (code: string) => getJson<DriverProfile>(`/api/chaos/drivers/${encodeURIComponent(code)}/profile/`),
  chaosModel: () => getJson<ModelPage>(`/api/chaos/model/`),
};

export type { AskBody };
