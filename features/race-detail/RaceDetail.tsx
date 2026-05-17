"use client";

import { useEffect } from "react";
import { RaceHeader } from "@/features/race-detail/components/RaceHeader";
import { RaceTabs } from "@/features/race-detail/components/RaceTabs";
import { useRaceDetail } from "@/features/race-detail/hooks/useRaceDetail";
import { useNavStore } from "@/_Stores/navStore";
import type { RaceDetailResponse } from "@/types/endpoints/racestypes";
import { TableSkeleton } from "@/components/animations/TableSkeleton";
import { Panel } from "@/components/Panel";

type RaceDetailShellProps = {
  year: number;
  round: number;
};

export const RaceDetailShell = ({ year, round }: RaceDetailShellProps) => {
  const setRaceYear = useNavStore((s) => s.setRaceYear);
  const setRaceRound = useNavStore((s) => s.setRaceRound);
  const storeRaceYear = useNavStore((s) => s.raceYear);
  const storeRaceRound = useNavStore((s) => s.raceRound);

  useEffect(() => {
    setRaceYear(year);
    setRaceRound(round);
  }, [year, round, setRaceYear, setRaceRound]);

  const effectiveYear = storeRaceYear ?? year;
  const effectiveRound = storeRaceRound ?? round;

  const { data: raceData, isLoading } = useRaceDetail(effectiveYear, effectiveRound);
  const race = { data: raceData ? raceData : undefined, loading: isLoading };
  const upcoming = race.data?.status === "upcoming";

  // Determine sprint/practice info from the adapted `sessions` produced by the adapter
  const isSprint = Boolean(race.data?.sessions?.some((s) => String(s.id).toLowerCase().includes("sprint")));
  const practiceSessions = race.data?.sessions
    ? (race.data.sessions.filter((s) => /^fp[1-3]$/.test(String(s.id))).map((s) => String(s.id).toUpperCase()) as ("FP1" | "FP2" | "FP3")[])
    : (["FP1", "FP2", "FP3"] as const);

  return (
    <main className="page-shell w-full">
      <RaceHeader race={race.data} loading={race.loading} year={effectiveYear} round={effectiveRound} isSprint={isSprint} />
      {race.loading ? (
        <Panel label="LOADING SESSION DATA">
          <TableSkeleton rows={10} customTexts={["Synchronizing session data...", "Fetching track telemetry..."]} />
        </Panel>
      ) : race.data ? (
        <RaceTabs
          year={effectiveYear}
          round={effectiveRound}
          upcoming={upcoming}
          isSprint={isSprint}
          practiceSessions={practiceSessions as ("FP1" | "FP2" | "FP3")[]}
        />
      ) : null}
    </main>
  );
};
