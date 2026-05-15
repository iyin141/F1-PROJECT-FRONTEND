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
  let url = path;
  if (typeof path === "string") {
    if (path.startsWith("/api/proxy")) {
      url = path;
    } else if (path === "/api") {
      url = "/api/proxy";
    } else if (path.startsWith("/api/")) {
      url = `/api/proxy${path.slice(4)}`;
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

export default { apiFetch };
