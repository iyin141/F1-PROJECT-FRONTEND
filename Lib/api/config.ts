const DEFAULT_PUBLIC_API_BASE_URL = "http://localhost:8000/api";
const DEFAULT_BACKEND_API_URL = "http://localhost:8000";

function normalizeUrl(value: string) {
  return value.replace(/\/$/, "");
}

export const API_BASE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_PUBLIC_API_BASE_URL,
);

export const BACKEND_API_URL = normalizeUrl(
  process.env.BACKEND_API_URL ?? DEFAULT_BACKEND_API_URL,
);