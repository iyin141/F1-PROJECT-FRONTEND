'use client';

import { AnalysisHeader } from "@/features/race-analysis/components/AnalysisHeader";
import { AnalysisPanels } from "@/features/race-analysis/components/AnalysisPanels";
import { useRaceDetail } from "@/features/race-detail/hooks/useRaceDetail";

type RaceAnalysisShellProps = { year: number; round: number };

export const RaceAnalysisShell = ({ year, round }: RaceAnalysisShellProps) => {
  const { data: race, isLoading } = useRaceDetail(year, round);
  return (
    <main className="page-shell w-full max-w-[min(100%,88rem)]">
      <AnalysisHeader race={race} year={year} round={round} />
      <AnalysisPanels year={year} round={round} />
    </main>
  );
};
