import { BACKEND_API_URL } from "@/Lib/api/config";

export async function GET(request: Request, { params: _params }: { params: Promise<{ driverCode: string }> }) {
  const params = await _params;
  const url = new URL(request.url);
  const search = url.search || "";
  const backendUrl = `${BACKEND_API_URL}/api/drivers/${params.driverCode}/career/${search}`;
  const res = await fetch(backendUrl);
  const headers = new Headers(res.headers);
  headers.delete("content-encoding");
  return new Response(res.body, { status: res.status, headers });
}
