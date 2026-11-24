import { BACKEND_API_URL } from "@/Lib/api/config";
import { isMock } from "@/Lib/api/mode";
import { proxyToBackend } from "@/Lib/api/proxy";
import { mockChaos } from "@/Lib/mock/v2";

export const dynamic = "force-dynamic";

/** GET /api/chaos/... -> backend /api/chaos/... (or fixtures when NEXT_PUBLIC_API_MODE=mock). */
export async function GET(request: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const url = new URL(request.url);
  if (isMock()) return mockChaos(slug, url.searchParams);
  return proxyToBackend(request, `${BACKEND_API_URL}/api/chaos/${slug.join("/")}/${url.search}`);
}
