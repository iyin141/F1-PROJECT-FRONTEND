import type { ApiErrorResponse } from "@/types/api";

const DEFAULT_BACKEND_API_URL = "http://localhost:8000";

function normalizeUrl(value: string) {
  return value.replace(/\/$/, "");
}

const BACKEND_API_URL = normalizeUrl(
  process.env.BACKEND_API_URL ?? DEFAULT_BACKEND_API_URL,
);

export function toBackendApiUrl(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${BACKEND_API_URL}/api${normalizedPath}`;
}

function extractErrorMessage(data: ApiErrorResponse, status: number): string {
  if (data.errors) {
    const firstField = Object.values(data.errors)[0];
    if (firstField?.length) return firstField[0];
  }
  if (Array.isArray(data.message)) return data.message[0];
  return data.error ?? data.message ?? `Backend request failed (${status})`;
}

export async function proxyBackendGet(pathname: string) {
  try {
    const response = await fetch(toBackendApiUrl(pathname), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const data = (isJson ? await response.json() : {}) as ApiErrorResponse;

    if (!response.ok) {
      return Response.json(
        { error: extractErrorMessage(data, response.status) },
        { status: response.status },
      );
    }

    return Response.json(data, {
      status: response.status,
    });
  } catch {
    return Response.json(
      { error: "Cannot reach backend server. Ensure Django is running." },
      { status: 502 },
    );
  }
}
