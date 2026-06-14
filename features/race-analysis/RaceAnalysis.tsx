"use client";

import { useState, useMemo } from "react";
import { AnalysisHeader } from "@/features/race-analysis/components/AnalysisHeader";
import { AnalysisTabs } from "@/features/race-analysis/components/AnalysisTabs";
import { useRaceDetail, useRaceResults } from "@/features/race-detail/hooks/useRaceDetail";
import { useSeasonSchedule } from "@/features/season-hub/hooks/useSeasonHub";
import Skeleton from "@/components/animations/Skeleton";
import { normalizeSessionForApi, formatSessionLabel } from "@/Lib/sessionCodes";

type RaceAnalysisShellProps = { year: number; round: number };

export const RaceAnalysisShell = ({ year, round }: RaceAnalysisShellProps) => {
  const { data: race, isLoading: raceLoading } = useRaceDetail(year, round);
  const { data: results, isLoading: resultsLoading } = useRaceResults(year, round);
  const [session, setSession] = useState("R");

  const { data: season } = useSeasonSchedule(year);

  const availableSessions = useMemo(() => {
    const orderForCode: Record<string, number> = {
      FP1: 1,
      FP2: 2,
      FP3: 3,
      SQ: 4,
      S: 5,
      Q: 6,
      R: 7,
    };

    const source = season?.find((r) => r.round === round)?.sessions ?? race?.sessions ?? [];

    return source
      .map((s) => {
        const raw = String((s as any).id ?? (s as any).id).toLowerCase();
       console.log(raw)
        const code = normalizeSessionForApi(raw) ?? raw.toUpperCase();

        const label = formatSessionLabel(code) || String(raw).toUpperCase();
        const order = orderForCode[code as string] ?? 99;
        return { code, label, order };
      })
      .sort((a, b) => a.order - b.order)
      .map((item) => ({ code: item.code, label: item.label }));
  }, [race, season, round]);

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
