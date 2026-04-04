import { proxyBackendGet } from "@/app/api/_lib/backend";
import type { RaceRouteParams } from "@/types/races";

type PracticeRouteParams = RaceRouteParams & {
  session: string;
};

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<PracticeRouteParams> },
) {
  const { year, round, session } = await context.params;
  return proxyBackendGet(`/races/${year}/${round}/practice/${session}/`);
}
