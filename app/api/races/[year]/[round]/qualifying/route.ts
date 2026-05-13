import { BACKEND_API_URL } from "@/Lib/api/config";

export async function GET(
  request: Request,
  { params: _params }: { params: Promise<{ year: string; round: string }> },
) {
  const params = await _params;
  const url = new URL(request.url);
  const search = url.search || "";
  const backendUrl = `${BACKEND_API_URL}/api/races/${params.year}/${params.round}/qualifying/${search}`;
  const res = await fetch(backendUrl);
  const headers = new Headers(res.headers);
  headers.delete("content-encoding");
  return new Response(res.body, { status: res.status, headers });
}
