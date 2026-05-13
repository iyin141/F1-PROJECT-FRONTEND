// Centralized API service helpers for calling local Next.js `/api/*` endpoints.
// Keep these thin: they perform fetch + error extraction and return parsed JSON.

const DEFAULT_HEADERS = { Accept: "application/json" };

function extractErrorMessage(data: any): string | undefined {
  if (!data) return undefined;
  if (data.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first) && first.length) return first[0];
  }
  if (Array.isArray(data.message)) return data.message[0];
  if (typeof data.message === "string") return data.message;
  return undefined;
}

export async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  // Route local `/api/*` calls to the centralized proxy: `/api/proxy/*`.
  let url = path;
  if (typeof path === 'string') {
    if (path.startsWith('/api/proxy')) {
      url = path;
    } else if (path === '/api') {
      url = '/api/proxy';
    } else if (path.startsWith('/api/')) {
      url = `/api/proxy${path.slice(4)}`; // replace leading `/api` with `/api/proxy`
    }
  }

  const headers = { ...(opts?.headers as Record<string, string> | undefined), ...DEFAULT_HEADERS };
  const res = await fetch(url, { ...(opts ?? {}), headers });

  const contentType = res.headers.get("content-type") || "";
  let body: any = undefined;
  try {
    if (contentType.includes("application/json")) body = await res.json();
    else body = await res.text();
  } catch {
    body = undefined;
  }

  if (!res.ok) {
    const message = extractErrorMessage(body) || `API ${res.status}`;
    throw new Error(message);
  }

  return body as T;
}

function buildAnalysisUrl(
  year: number,
  round: number,
  endpoint: string,
  params?: Record<string, string | number | undefined>,
): string {
  const query = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) query.set(k, String(v));
    }
  }
  const qs = query.toString();
  return `/api/analysis/races/${year}/${round}/${endpoint}/${qs ? `?${qs}` : ""}`;
}

// Season / standings
export const getSeasonSchedule = (year: number) => apiFetch<any>(`/api/races/${year}/`);
export const getDriverStandings = (year: number) => apiFetch<any>(`/api/drivers/year/${year}/`);
export const getConstructorStandings = (year: number) => apiFetch<any>(`/api/constructors/${year}/`);

// Races
export const getRaceDetail = (year: number, round: number) => apiFetch<any>(`/api/races/${year}/${round}/`);
export const getRaceResults = (year: number, round: number) => apiFetch<any>(`/api/races/${year}/${round}/results/`);
export const getQualifyingResults = (year: number, round: number) => apiFetch<any>(`/api/races/${year}/${round}/qualifying/`);
export const getPracticeResults = (year: number, round: number, session: string) =>
  apiFetch<any>(`/api/races/${year}/${round}/practice/${session}/`);
export const getSprintResults = (year: number, round: number) => apiFetch<any>(`/api/races/${year}/${round}/sprint/`);
export const getSprintShootoutResults = (year: number, round: number) =>
  apiFetch<any>(`/api/races/${year}/${round}/sprint-shootout/`);

// Unified endpoints
export const getUnifiedWeather = (year: number, round: number, session = "R") =>
  apiFetch<any>(`/api/unified/races/${year}/${round}/weather/?session=${session}`);
export const getUnifiedIncidents = (year: number, round: number, session = "R") =>
  apiFetch<any>(`/api/unified/races/${year}/${round}/incidents/?session=${session}`);
export const getUnifiedPositions = (year: number, round: number, session = "R", sample?: number) =>
  apiFetch<any>(`/api/unified/races/${year}/${round}/positions/?session=${session}${sample ? `&sample_interval=${sample}` : ""}`);
export const getUnifiedPitStops = (year: number, round: number, session = "R") =>
  apiFetch<any>(`/api/unified/races/${year}/${round}/pit-stops/?session=${session}`);

export const getUnifiedDrs = (year: number, round: number, session = "R") =>
  apiFetch<any>(`/api/unified/races/${year}/${round}/drs/?session=${session}`);

export const getUnifiedTrackStatus = (year: number, round: number, session = "R") =>
  apiFetch<any>(`/api/unified/races/${year}/${round}/track-status/?session=${session}`);

export const getFullSession = (year: number, round: number, params?: { include?: string[]; session?: string; driver?: string; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.include && params.include.length) qs.set("include", params.include.join(","));
  if (params?.session) qs.set("session", params.session);
  if (params?.driver) qs.set("driver", params.driver);
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  const qstr = qs.toString();
  return apiFetch<any>(`/api/unified/races/${year}/${round}/full-session/${qstr ? `?${qstr}` : ""}`);
};

// Analysis endpoints (laps, stints, tyre strategy, sector analysis etc.)
export const getAnalysis = (year: number, round: number, endpoint: string, params?: Record<string, string | number | undefined>) =>
  apiFetch<any>(buildAnalysisUrl(year, round, endpoint, params));

export const getLapsAnalysis = (year: number, round: number, params?: Record<string, string | number | undefined>) =>
  getAnalysis(year, round, "laps", params);

export const getTelemetry = (year: number, round: number, params?: Record<string, string | number | undefined>) =>
  apiFetch<any>(`/api/analysis/races/${year}/${round}/telemetry/?${new URLSearchParams(params as any)}`);

export const getTelemetryOverlay = (year: number, round: number, params?: Record<string, string | number | undefined>) =>
  apiFetch<any>(`/api/analysis/races/${year}/${round}/telemetry/overlay/?${new URLSearchParams(params as any)}`);

export const getTelemetrySummary = (year: number, round: number, params?: Record<string, string | number | undefined>) =>
  apiFetch<any>(`/api/analysis/races/${year}/${round}/telemetry/summary/?${new URLSearchParams(params as any)}`);

// Replay helpers
export const getReplayPositions = (year: number, round: number) =>
  apiFetch<any>(`/api/unified/races/${year}/${round}/positions/?session=R&sample_interval=1`);
export const getReplayIncidents = (year: number, round: number) =>
  apiFetch<any>(`/api/unified/races/${year}/${round}/incidents/?session=R`);
export const getReplayPitStops = (year: number, round: number) =>
  apiFetch<any>(`/api/unified/races/${year}/${round}/pit-stops/?session=R`);

// Driver record
export const getDriverCareer = (driverCode: string) => apiFetch<any>(`/api/drivers/${driverCode}/career/`);
export const getDriverSeason = (driverCode: string, year: number) => apiFetch<any>(`/api/drivers/${driverCode}/${year}/`);

export default {
  apiFetch,
};
