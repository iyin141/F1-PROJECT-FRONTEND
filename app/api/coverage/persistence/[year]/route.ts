import { proxyBackendGet } from "@/app/api/_lib/backend";
import type { YearParams } from "@/types/mvp-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<YearParams> }) {
  const { year } = await context.params;
  return proxyBackendGet(`/coverage/persistence/${year}/`, request);
}
