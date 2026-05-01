'use client';

import { AnalysisHeader } from "@/features/race-analysis/components/AnalysisHeader";
import { AnalysisPanels } from "@/features/race-analysis/components/AnalysisPanels";
import { useRaceDetail } from "@/features/race-detail/hooks/useRaceDetail";
import { adaptRaceDetail } from "@/Lib/adapters";

type RaceAnalysisShellProps = { year: number; round: number };

export const RaceAnalysisShell = ({ year, round }: RaceAnalysisShellProps) => {
  const { data: raceData, isLoading } = useRaceDetail(year, round);
  const race = { data: raceData ? adaptRaceDetail(raceData, year) : undefined, loading: isLoading };
  return (
    <main className="page-shell w-full max-w-[min(100%,88rem)]">
      <AnalysisHeader race={race.data} year={year} round={round} />
      <AnalysisPanels year={year} round={round} />
    </main>
  );
};
