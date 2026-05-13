import { notFound } from "next/navigation";
import { HydrationBoundary, prefetchQueries } from "@/Lib/prefetch";
import { queryKeys } from "@/Lib/queryKeys";
import { RaceDetailShell } from "@/features/race-detail/RaceDetail";

type RaceDetailPageProps = {
  params: Promise<{ year: string; round: string }>;
};

const MIN_YEAR = 1950;

export default async function RaceDetailPage({ params }: RaceDetailPageProps) {
  const { year: yearParam, round: roundParam } = await params;
  const year = Number(yearParam);
  const round = Number(roundParam);
  const currentYear = new Date().getFullYear();

  if (year < MIN_YEAR || year > currentYear || round < 1 || round > 24) {
    notFound();
  }

  console.log("[prefetch] RaceDetailPage: starting prefetch", { year, round });
  const { dehydratedState } = await prefetchQueries([
    {
      queryKey: queryKeys.raceResults.detail(year, round),
      pathname: `/races/${year}/${round}/`,
    },
    {
      queryKey: queryKeys.raceResults.session(year, round, "R"),
      pathname: `/races/${year}/${round}/results/`,
    },
    {
      queryKey: queryKeys.raceResults.qualifying(year, round),
      pathname: `/races/${year}/${round}/qualifying/`,
    },
  ]);
  console.log("[prefetch] RaceDetailPage: prefetch complete", { year, round });

  return (
    <HydrationBoundary state={dehydratedState}>
      <RaceDetailShell year={year} round={round} />
    </HydrationBoundary>
  );
}
