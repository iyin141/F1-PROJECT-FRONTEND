import type { ApiErrorResponse } from "@/types/api";

function extractErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const typedPayload = payload as Partial<ApiErrorResponse> & {
      error?: string;
      message?: string | string[];
    };

    if (typeof typedPayload.detail === "string") {
      return typedPayload.detail;
    }

    if (typeof typedPayload.error === "string") {
      return typedPayload.error;
    }

    if (typeof typedPayload.message === "string") {
      return typedPayload.message;
    }

    if (Array.isArray(typedPayload.message) && typeof typedPayload.message[0] === "string") {
      return typedPayload.message[0];
    }
  }

  return `Request failed (${status}).`;
}

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, response.status));
  }

  return payload as T;
}

export function withQuery(
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>,
): string {
  if (!query) {
    return path;
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue;
    }

    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}
