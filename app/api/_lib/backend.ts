import { BACKEND_API_URL } from "@/Lib/api/config";

function buildBackendUrl(pathname: string, request?: Request): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const base = `${BACKEND_API_URL}/api${normalizedPath}`;

  if (!request) {
    return base;
  }

  const incomingUrl = new URL(request.url);
  const query = incomingUrl.searchParams.toString();

  return query ? `${base}?${query}` : base;
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

export async function proxyBackendGet(pathname: string, request?: Request): Promise<Response> {
  try {
    const response = await fetch(buildBackendUrl(pathname, request), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (isJson) {
      const payload = await response.json();

      if (!response.ok) {
        const detail =
          typeof payload?.detail === "string"
            ? payload.detail
            : typeof payload?.error === "string"
              ? payload.error
              : toErrorDetail(response.status);

        return Response.json({ detail }, { status: response.status });
      }

      return Response.json(payload, { status: response.status });
    }

    if (!response.ok) {
      return Response.json(
        {
          detail: toErrorDetail(response.status),
        },
        { status: response.status },
      );
    }

    const textPayload = await response.text();
    return new Response(textPayload, {
      status: response.status,
      headers: {
        "content-type": contentType || "text/plain",
      },
    });
  } catch {
    return Response.json(
      {
        detail: "Cannot reach backend server. Ensure Django is running.",
      },
      { status: 502 },
    );
  }
}
