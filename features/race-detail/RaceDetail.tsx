'use client';

import { RaceHeader } from "@/features/race-detail/components/RaceHeader";
import { RaceTabs } from "@/features/race-detail/components/RaceTabs";
import { useRaceDetail } from "@/features/race-detail/hooks/useRaceDetail";
import type { RaceDetailResponse } from "@/types/endpoints/racestypes";

type RaceDetailShellProps = {
  year: number;
  round: number;
};

export const RaceDetailShell = ({ year, round }: RaceDetailShellProps) => {
  const { data: raceData, isLoading } = useRaceDetail(year, round);
  const race = { data: raceData ? raceData : undefined, loading: isLoading };
  const upcoming = race.data?.status === "upcoming";

  // Determine sprint/practice info from the adapted `sessions` produced by the adapter
  const isSprint = Boolean(race.data?.sessions?.some((s) => String(s.id).toLowerCase().includes("sprint")));
  const practiceSessions = race.data?.sessions
    ? (race.data.sessions.filter((s) => /^fp[1-3]$/.test(String(s.id))).map((s) => String(s.id).toUpperCase()) as ("FP1" | "FP2" | "FP3")[])
    : (["FP1", "FP2", "FP3"] as const);

  return (
    <main className="page-shell w-full">
      <RaceHeader race={race.data} loading={race.loading} year={year} round={round} isSprint={isSprint} />
      {race.data && (
        <RaceTabs
          year={year}
          round={round}
          upcoming={upcoming}
          isSprint={isSprint}
          practiceSessions={practiceSessions as ("FP1" | "FP2" | "FP3")[]}
        />
      )}
    </main>
  );
};
