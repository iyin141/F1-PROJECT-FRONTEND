'use client';

import { useState, useMemo } from "react";
import { AnalysisHeader } from "@/features/race-analysis/components/AnalysisHeader";
import { AnalysisTabs } from "@/features/race-analysis/components/AnalysisTabs";
import { useRaceDetail, useRaceResults } from "@/features/race-detail/hooks/useRaceDetail";
import Skeleton from "@/components/animations/Skeleton";

type RaceAnalysisShellProps = { year: number; round: number };

export const RaceAnalysisShell = ({ year, round }: RaceAnalysisShellProps) => {
  const { data: race, isLoading: raceLoading } = useRaceDetail(year, round);
  const { data: results, isLoading: resultsLoading } = useRaceResults(year, round);
  const [session, setSession] = useState("R");

  const availableSessions = useMemo(() => {
    if (!race) return [];
    
    const list: Array<{ code: string; label: string }> = [
      { code: "R", label: "RACE" },
    ];

    if (race.sprint) {
      list.push({ code: "S", label: "SPRINT" });
      list.push({ code: "SS", label: "SPRINT SHOOTOUT" });
    }

    list.push({ code: "Q", label: "QUALIFYING" });

    if (race.fp1) list.push({ code: "FP1", label: "FP1" });
    if (race.fp2) list.push({ code: "FP2", label: "FP2" });
    if (race.fp3) list.push({ code: "FP3", label: "FP3" });

    return list;
  }, [race]);

  const drivers = useMemo(() => {
    return (results ?? [])
      .filter((r) => typeof r.position === "number")
      .sort((a, b) => (a.position as number) - (b.position as number))
      .map((r) => r.driver);
  }, [results]);

  if (raceLoading || resultsLoading) {
    return (
      <main className="page-shell w-full max-w-[min(100%,88rem)]">
        <AnalysisHeader race={undefined} year={year} round={round} />
        <div className="space-y-6">
          <Skeleton height={40} />
          <Skeleton height={280} />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell w-full max-w-[min(100%,88rem)]">
      <AnalysisHeader
        race={race}
        year={year}
        round={round}
        session={session}
        onSessionChange={setSession}
        availableSessions={availableSessions}
      />
      <AnalysisTabs
        year={year}
        round={round}
        session={session}
        drivers={drivers}
      />
    </main>
  );
};
