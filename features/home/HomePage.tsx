'use client';

import { useMemo } from "react";
import { CalendarStripPanel } from "@/features/home/components/CalendarStripPanel";
import { LastRacePanel } from "@/features/home/components/LastRacePanel";
import { RightColumnPanels } from "@/features/home/components/RightColumnPanels";
import { StatusStrip } from "@/features/home/components/StatusStrip";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  useSeasonScheduleFallback,
  useDriverStandings,
  useConstructorStandings,
} from "@/features/season-hub/hooks/useSeasonHub";
import {
  useRaceDetail,
  useRaceResults,
  useRaceWeather,
  useRaceIncidents,
} from "@/features/race-detail/hooks/useRaceDetail";
import {
  adaptSeasonSchedule,
  adaptRaceDetail,
  adaptRaceResults,
  adaptDriverStandings,
  adaptConstructorStandings,
  adaptWeather,
  adaptIncidents,
} from "@/Lib/adapters";

const CURRENT_YEAR = new Date().getFullYear();

export const HomePageShell = () => {
  // ── Season schedule ────────────────────────────────────────────────────
  const {
    data: scheduleRaw,
    selectedYear,
    isLoading: scheduleLoading,
  } = useSeasonScheduleFallback(CURRENT_YEAR);

  const scheduleYear = selectedYear ?? CURRENT_YEAR;

  const calendarRaces = useMemo(
    () => (scheduleRaw ? adaptSeasonSchedule(scheduleRaw) : undefined),
    [scheduleRaw],
  );

  const liveRace = useMemo(
    () => calendarRaces?.find((r) => r.status === "live"),
    [calendarRaces],
  );

  const lastCompletedRace = useMemo(
    () => calendarRaces?.filter((r) => r.status === "completed").at(-1),
    [calendarRaces],
  );

  const roundOneRace = useMemo(
    () => calendarRaces?.find((r) => r.round === 1),
    [calendarRaces],
  );

  const firstUpcomingRace = useMemo(
    () => calendarRaces?.find((r) => r.status === "upcoming"),
    [calendarRaces],
  );

  const targetRace = useMemo(
    () => liveRace ?? lastCompletedRace ?? roundOneRace ?? firstUpcomingRace,
    [liveRace, lastCompletedRace, roundOneRace, firstUpcomingRace],
  );

  const nextUpcomingRace = useMemo(
    () => calendarRaces?.find((r) => r.status === "upcoming" || r.status === "live"),
    [calendarRaces],
  );

  const hasLastRace = Boolean(targetRace);
  // Only fetch result-type data (results/weather/incidents) for completed races;
  // live and upcoming races don't have this data yet.
  const hasCompletedRace = hasLastRace && targetRace?.status === "completed";
  const lastYear = targetRace?.year ?? scheduleYear;
  const lastRound = targetRace?.round ?? 1;

  // ── Last race detail + results ─────────────────────────────────────────
  const { data: raceDetailRaw, isLoading: raceDetailLoading } = useRaceDetail(lastYear, lastRound, hasLastRace);
  const { data: resultsRaw, isLoading: resultsLoading } = useRaceResults(lastYear, lastRound, hasCompletedRace);
  const { data: weatherRaw } = useRaceWeather(lastYear, lastRound, hasCompletedRace);
  const { data: incidentsRaw } = useRaceIncidents(lastYear, lastRound, hasCompletedRace);

  // ── Standings ──────────────────────────────────────────────────────────
  const { data: driversRaw, isLoading: driversLoading } = useDriverStandings(scheduleYear);
  const { data: constructorsRaw, isLoading: constructorsLoading } = useConstructorStandings(scheduleYear);

  // ── Adapted data ───────────────────────────────────────────────────────
  const lastRace = {
    data: raceDetailRaw && hasLastRace ? adaptRaceDetail(raceDetailRaw, lastYear) : undefined,
    loading: scheduleLoading || raceDetailLoading,
    error: undefined,
    reload: () => {},
  };
  const lastResults = {
    data: resultsRaw && hasLastRace ? adaptRaceResults(resultsRaw) : undefined,
    loading: resultsLoading,
  };
  const lastWeather = { data: weatherRaw ? adaptWeather(weatherRaw) : undefined };
  const lastIncidents = { data: incidentsRaw ? adaptIncidents(incidentsRaw) : undefined };

  const standings = {
    data: driversRaw ? adaptDriverStandings(driversRaw) : undefined,
    loading: driversLoading,
  };
  const constructors = {
    data: constructorsRaw ? adaptConstructorStandings(constructorsRaw) : undefined,
    loading: constructorsLoading,
  };

  const calendar = { data: calendarRaces, loading: scheduleLoading };
  const nextRace = { data: nextUpcomingRace, loading: scheduleLoading };

  return (
    <main className="min-h-screen w-full page-shell">
      <StatusStrip
        calendar={calendar.data}
        leader={standings.data?.[0]}
        hasError={Boolean(lastRace.error)}
        onRetry={lastRace.reload}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold tracking-tight">Race Control</h1>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LastRacePanel
            race={lastRace.data}
            results={lastResults.data}
            incidents={lastIncidents.data}
            weather={lastWeather.data}
            loading={lastRace.loading || lastResults.loading}
          />
        </div>

        <RightColumnPanels
          year={scheduleYear}
          nextRace={nextRace.data}
          nextRaceLoading={nextRace.loading}
          standings={standings.data}
          standingsLoading={standings.loading}
          constructors={constructors.data}
          constructorsLoading={constructors.loading}
        />
      </div>

      <CalendarStripPanel calendar={calendar.data} loading={calendar.loading} />
    </main>
  );
};
