import { BACKEND_API_URL } from "@/Lib/api/config";
import { proxyToBackend } from "@/Lib/api/proxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.search || "";
  const backendUrl = `${BACKEND_API_URL}/api/drivers/search-by-name${search}`;
  const res = await proxyToBackend(request, backendUrl);
  const headers = new Headers(res.headers);
  headers.delete("content-encoding");
  return new Response(res.body, { status: res.status, headers });
}
