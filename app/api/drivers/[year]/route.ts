import { proxyBackendGet } from "@/app/api/_lib/backend";
import type { YearParams } from "@/types/mvp-api";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<YearParams> }) {
  const { year } = await context.params;
  return proxyBackendGet(`/drivers/${year}/`);
}
