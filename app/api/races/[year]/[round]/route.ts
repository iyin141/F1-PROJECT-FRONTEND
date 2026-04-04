import { proxyBackendGet } from "@/app/api/_lib/backend";
import type { RaceRouteParams } from "@/types/races";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<RaceRouteParams> },
) {
  const { year, round } = await context.params;
  return proxyBackendGet(`/races/${year}/${round}/`);
}
