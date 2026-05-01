'use client';

import { RaceHeader } from "@/features/race-detail/components/RaceHeader";
import { RaceTabs } from "@/features/race-detail/components/RaceTabs";
import { useRaceDetail } from "@/features/race-detail/hooks/useRaceDetail";
import { adaptRaceDetail } from "@/Lib/adapters";

type RaceDetailShellProps = {
  year: number;
  round: number;
};

export const RaceDetailShell = ({ year, round }: RaceDetailShellProps) => {
  const { data: raceData, isLoading } = useRaceDetail(year, round);
  const race = { data: raceData ? adaptRaceDetail(raceData, year) : undefined, loading: isLoading };
  const upcoming = race.data?.status === "upcoming";

  return (
    <main className="page-shell w-full">
      <RaceHeader race={race.data} loading={race.loading} year={year} round={round} />
      {race.data && <RaceTabs year={year} round={round} upcoming={upcoming} />}
    </main>
  );
};
