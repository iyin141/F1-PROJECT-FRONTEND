"use client";

import { RightColumnPanels } from "./RightColumnPanels";
import { useDriverStandings, useConstructorStandings } from "@/features/season-hub/hooks/useSeasonHub";

type StandingsSectionProps = {
  year: number;
};

export function StandingsSection({ year }: StandingsSectionProps) {
  const { data: standings, isLoading: standingsLoading } = useDriverStandings(year);
  const { data: constructors, isLoading: constructorsLoading } = useConstructorStandings(year);

  return (
    <RightColumnPanels
      year={year}
      nextRace={undefined}
      nextRaceLoading={false}
      standings={standings}
      standingsLoading={standingsLoading}
      constructors={constructors}
      constructorsLoading={constructorsLoading}
    />
  );
}
