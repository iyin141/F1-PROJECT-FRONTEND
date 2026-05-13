import { notFound } from "next/navigation";

import { HydrationBoundary, prefetchQueries } from "@/Lib/prefetch";
import { queryKeys } from "@/Lib/queryKeys";
import { DriverRecordShell } from "@/features/driver-record";

type DriverYearPageProps = {
  params: Promise<{ driverCode: string; year: string }>;
};

const MIN_YEAR = 1950;

export default async function DriverYearPage({ params }: DriverYearPageProps) {
  const { driverCode: rawCode, year: yearParam } = await params;
  const driverCode = rawCode.toUpperCase();

  const parsed = Number(yearParam);
  const currentYear = new Date().getFullYear();
  const year = Number.isFinite(parsed) ? parsed : currentYear;

  if (year < MIN_YEAR || year > currentYear) {
    notFound();
  }

  console.log("[prefetch] DriverYearPage: starting prefetch", { driverCode, year });
  const { dehydratedState } = await prefetchQueries([
    {
      queryKey: queryKeys.driverStandings.career(driverCode),
      pathname: `/drivers/${driverCode}/career/`,
    },
    {
      queryKey: queryKeys.driverStandings.season(driverCode, year),
      pathname: `/drivers/${driverCode}/${year}/`,
    },
  ]);
  console.log("[prefetch] DriverYearPage: prefetch complete", { driverCode, year });

  return (
    <HydrationBoundary state={dehydratedState}>
      <DriverRecordShell driverCode={driverCode} year={year} />
    </HydrationBoundary>
  );
}
