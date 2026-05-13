"use client";

import { LastRacePanel } from "./LastRacePanel";
import { useSeasonSchedule } from "@/features/season-hub/hooks/useSeasonHub";
import {
  useRaceDetail,
  useRaceResults,
  useQualifyingResults,
  useRaceWeather,
  useRaceIncidents,
} from "@/features/race-detail/hooks/useRaceDetail";

type LatestRaceSectionProps = {
  year: number;
};

export function LatestRaceSection({ year }: LatestRaceSectionProps) {
  const { data: calendarRaces, isLoading: scheduleLoading } = useSeasonSchedule(year);

  const liveRace = calendarRaces?.find((r) => r.status === "live");
  const lastCompletedRace = calendarRaces?.filter((r) => r.status === "completed").at(-1);
  const roundOneRace = calendarRaces?.find((r) => r.round === 1);
  const firstUpcomingRace = calendarRaces?.find((r) => r.status === "upcoming");

  const targetRace = liveRace ?? lastCompletedRace ?? roundOneRace ?? firstUpcomingRace;

  if (!targetRace) {
    return <LastRacePanel race={undefined} results={undefined} qualiResults={undefined} incidents={undefined} weather={undefined} loading={scheduleLoading} />;
  }

  const lastYear = targetRace.year ?? year;
  const lastRound = targetRace.round ?? 1;
  const hasCompletedRace = targetRace.status === "completed";

  const { data: race, isLoading: raceLoading } = useRaceDetail(lastYear, lastRound, Boolean(targetRace));
  const { data: results, isLoading: resultsLoading } = useRaceResults(lastYear, lastRound, hasCompletedRace);
  const { data: qualiResults } = useQualifyingResults(lastYear, lastRound, hasCompletedRace);
  const { data: weather, isLoading: weatherLoading } = useRaceWeather(lastYear, lastRound, hasCompletedRace);
  const { data: incidents, isLoading: incidentsLoading } = useRaceIncidents(lastYear, lastRound, hasCompletedRace);

  const loading = scheduleLoading || raceLoading || resultsLoading || weatherLoading || incidentsLoading;

  return (
    <LastRacePanel
      race={race}
      results={results}
      qualiResults={qualiResults}
      incidents={incidents}
      weather={weather}
      loading={loading}
    />
  );
}
