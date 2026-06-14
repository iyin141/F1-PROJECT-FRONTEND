import { BACKEND_API_URL } from "@/Lib/api/config";
import { proxyToBackend } from "@/Lib/api/proxy";

export async function GET(request: Request, { params: _params }: any) {
  const params = await _params;
  const { year, round, slug } = params || {};
  const url = new URL(request.url);
  const search = url.search || "";
  const parts = ["unified", "races", year, round].concat(slug ? (Array.isArray(slug) ? slug : [slug]) : []);
  const backendUrl = `${BACKEND_API_URL}/api/${parts.join("/")}/${search}`;
  const res = await proxyToBackend(request, backendUrl);
  const headers = new Headers(res.headers);
  headers.delete("content-encoding");
  return new Response(res.body, { status: res.status, headers });
}
