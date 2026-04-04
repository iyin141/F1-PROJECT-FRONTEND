import { proxyBackendGet } from "@/app/api/_lib/backend";
import type { YearRouteParams } from "@/types/races";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<YearRouteParams> },
) {
  const { year } = await context.params;
  return proxyBackendGet(`/races/${year}/`);
}
