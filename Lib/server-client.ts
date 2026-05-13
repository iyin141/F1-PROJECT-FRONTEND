import "server-only";

import { BACKEND_API_URL } from "@/Lib/api/config";

export type ServerQueryValue = string | number | boolean | null | undefined;

type ServerQuery = Record<string, ServerQueryValue>;

export function clampYear(year: number): number {
  return Math.min(year, new Date().getFullYear());
}

function buildServerUrl(pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${BACKEND_API_URL}/api${normalizedPath}`;
}

function withQueryString(url: string, query: ServerQuery): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  }

  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

function toErrorDetail(status: number): string {
  if (status === 404) {
    return "Resource not found.";
  }

  if (status >= 500) {
    return "Backend server error.";
  }

  return `Backend request failed (${status}).`;
}

export async function serverGetJson<T>(pathname: string, query?: ServerQuery): Promise<T> {
  const url = query ? withQueryString(buildServerUrl(pathname), query) : buildServerUrl(pathname);
  const startedAt = Date.now();
  const querySummary = query ? JSON.stringify(query) : "{}";

  console.log(`[serverGetJson] request GET ${url} query=${querySummary}`);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const durationMs = Date.now() - startedAt;
    console.log(`[serverGetJson] response GET ${url} status=${response.status} durationMs=${durationMs}`);

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (!isJson) {
      if (!response.ok) {
        console.error(`[serverGetJson] ${url} -> ${toErrorDetail(response.status)}`);
        return {} as T;
      }

      return {} as T;
    }

    const payload = await response.json();

    // Log response payload structure
    if (Array.isArray(payload)) {
      console.log(`[serverGetJson] return object: Array[${payload.length}]`, payload.slice(0, 2));
    } else if (typeof payload === 'object' && payload !== null) {
      const keys = Object.keys(payload);
      console.log(`[serverGetJson] return object: Object with keys [${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}]`);
      // Log nested standings/drivers arrays if present
      if (payload.standings && Array.isArray(payload.standings)) {
        console.log(`  └─ standings: Array[${payload.standings.length}]`, payload.standings.slice(0, 1));
      }
      if (payload.drivers && Array.isArray(payload.drivers)) {
        console.log(`  └─ drivers: Array[${payload.drivers.length}]`, payload.drivers.slice(0, 1));
      }
      if (payload.data && Array.isArray(payload.data)) {
        console.log(`  └─ data: Array[${payload.data.length}]`);
      }
    } else {
      console.log(`[serverGetJson] return object:`, payload);
    }

    if (!response.ok) {
      const detail =
        typeof payload?.detail === "string"
          ? payload.detail
          : typeof payload?.error === "string"
            ? payload.error
            : toErrorDetail(response.status);

      console.error(`[serverGetJson] ${url} -> ${detail}`);
      return {} as T;
    }

    return payload as T;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    console.error(`[serverGetJson] error GET ${url} durationMs=${durationMs}:`, error);
    return {} as T;
  }
}
