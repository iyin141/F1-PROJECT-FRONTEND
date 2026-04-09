import { proxyBackendGet } from "@/app/api/_lib/backend";
import type { YearRoundParams } from "@/types/mvp-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<YearRoundParams> }) {
  const { year, round } = await context.params;
  return proxyBackendGet(`/unified/races/${year}/${round}/full-session/`, request);
}
