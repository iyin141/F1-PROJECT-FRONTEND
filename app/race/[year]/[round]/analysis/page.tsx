import { notFound } from "next/navigation";
import { HydrationBoundary, prefetchQueries } from "@/Lib/prefetch";
import { queryKeys } from "@/Lib/queryKeys";
import { RaceAnalysisShell } from "@/features/race-analysis/RaceAnalysis";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Race Analysis · F1 Control Room",
};

type AnalysisPageProps = {
  params: Promise<{ year: string; round: string }>;
};

const MIN_YEAR = 1950;

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { year: yearParam, round: roundParam } = await params;
  const year = Number(yearParam);
  const round = Number(roundParam);
  const currentYear = new Date().getFullYear();

  if (year < MIN_YEAR || year > currentYear || round < 1 || round > 24) {
    notFound();
  }

  console.log("[prefetch] RaceAnalysisPage: starting prefetch", { year, round });
  const { dehydratedState } = await prefetchQueries([
    {
      queryKey: queryKeys.lapAnalysis.byType(year, round, "laps"),
      pathname: `/analysis/races/${year}/${round}/laps/`,
    },
    {
      queryKey: queryKeys.lapAnalysis.byType(year, round, "stints"),
      pathname: `/analysis/races/${year}/${round}/stints/`,
    },
    {
      queryKey: queryKeys.lapAnalysis.byType(year, round, "tyre"),
      pathname: `/analysis/races/${year}/${round}/tyre-strategy/`,
    },
  ]);
  console.log("[prefetch] RaceAnalysisPage: prefetch complete", { year, round });

  return (
    <HydrationBoundary state={dehydratedState}>
      <RaceAnalysisShell year={year} round={round} />
    </HydrationBoundary>
  );
}
