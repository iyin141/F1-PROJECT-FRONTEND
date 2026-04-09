import { proxyBackendGet } from "@/app/api/_lib/backend";
import type { YearRoundParams } from "@/types/mvp-api";

type PracticeRouteParams = YearRoundParams & {
  session: string;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<PracticeRouteParams> }) {
  const { year, round, session } = await context.params;
  return proxyBackendGet(`/races/${year}/${round}/practice/${session}/`);
}
