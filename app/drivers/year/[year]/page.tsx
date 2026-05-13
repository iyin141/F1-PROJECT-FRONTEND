import { notFound } from "next/navigation";

import { HydrationBoundary, prefetchQueries } from "@/Lib/prefetch";
import { queryKeys } from "@/Lib/queryKeys";
import { DriversHubPage } from "@/features/drivers-hub/DriversHubPage";

type DriversYearPageProps = {
  params: Promise<{ year: string }>;
};

const MIN_YEAR = 1950;

export default async function DriversYearPage({ params }: DriversYearPageProps) {
  const { year: yearParam } = await params;
  const parsed = Number(yearParam);
  const currentYear = new Date().getFullYear();
  const year = Number.isFinite(parsed) ? parsed : currentYear;

  if (year < MIN_YEAR || year > currentYear) {
    notFound();
  }

  console.log("[prefetch] DriversYearPage: starting prefetch", { year });
  const { dehydratedState } = await prefetchQueries([
    {
      queryKey: queryKeys.driverStandings.grid(year),
      pathname: `/drivers/${year}/`,
    },
  ]);
  console.log("[prefetch] DriversYearPage: prefetch complete", { year });

  return (
    <HydrationBoundary state={dehydratedState}>
      <DriversHubPage year={year} />
    </HydrationBoundary>
  );
}
