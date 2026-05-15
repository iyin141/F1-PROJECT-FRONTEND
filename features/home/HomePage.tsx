'use client';

import { useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowSlider } from "@/features/home/components/ArrowSlider";
import { CalendarStripPanel } from "@/features/home/components/CalendarStripPanel";
import { LastRacePanel } from "@/features/home/components/LastRacePanel";
import { RightColumnPanels } from "@/features/home/components/RightColumnPanels";
import { StatusStrip } from "@/features/home/components/StatusStrip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSeasonSchedule, useDriverStandings, useConstructorStandings } from "@/features/season-hub/hooks/useSeasonHub";
import { useNavStore } from "@/_Stores/navStore";
import { useIsRestoring } from "@/_Stores/QueryProvider";
import {
  useRaceDetail,
  useRaceResults,
  useRaceWeather,
  useRaceIncidents,
  useQualifyingResults,
} from "@/features/race-detail/hooks/useRaceDetail";

const CURRENT_YEAR = new Date().getFullYear();

type HomePageShellProps = {
  initialYear: number;
};

export const HomePageShell = ({ initialYear }: HomePageShellProps) => {
  const searchParams = useSearchParams();

  const urlYear = searchParams.get("year");
  const urlRound = searchParams.get("round");

  const parsedYear = urlYear ? parseInt(urlYear, 10) : undefined;
  const parsedRound = urlRound ? parseInt(urlRound, 10) : undefined;

  const setHomeYear = useNavStore((s) => s.setHomeYear);
  const setHomeRound = useNavStore((s) => s.setHomeRound);
  const storeHomeYear = useNavStore((s) => s.homeYear);

  // Seed store on mount/param change
  useEffect(() => {
    const seedYear = parsedYear ?? initialYear;
    setHomeYear(seedYear);
    if (parsedRound) setHomeRound(parsedRound);
  }, [parsedYear, parsedRound, initialYear, setHomeYear, setHomeRound]);

  // Re-seed when user navigates with browser Back/Forward (popstate)
  useEffect(() => {
    const onPopState = () => {
      try {
        const url = new URL(window.location.href);
        const searchYearRaw = url.searchParams.get("year");
        const searchRoundRaw = url.searchParams.get("round");
        const searchYear = searchYearRaw ? parseInt(searchYearRaw, 10) : undefined;
        const searchRound = searchRoundRaw ? parseInt(searchRoundRaw, 10) : undefined;

        // Prefer explicit search params for shareability
        if (searchYear !== undefined && !Number.isNaN(searchYear)) {
          setHomeYear(searchYear);
        } else {
          setHomeYear(initialYear);
        }

        if (searchRound !== undefined && !Number.isNaN(searchRound)) {
          setHomeRound(searchRound);
        } else {
          setHomeRound(null);
        }
      } catch (e) {
        // ignore malformed URL
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [initialYear, setHomeYear, setHomeRound]);

  // ── Season schedule ────────────────────────────────────────────────────
  const scheduleYear = storeHomeYear ?? parsedYear ?? initialYear;
  const { data: calendar, isLoading: scheduleLoading } = useSeasonSchedule(scheduleYear);

  const liveRace = useMemo(() => calendar?.find((r) => r.status === "live"), [calendar]);
  const lastCompletedRace = useMemo(() => calendar?.filter((r) => r.status === "completed").at(-1), [calendar]);
  const roundOneRace = useMemo(() => calendar?.find((r) => r.round === 1), [calendar]);
  const nextUpcomingRace = useMemo(() => calendar?.find((r) => r.status === "upcoming" || r.status === "live"), [calendar]);

  const targetRace = useMemo(() => {
    if (parsedRound && calendar) {
      return calendar.find((r) => r.round === parsedRound) ?? null;
    }
    return liveRace ?? lastCompletedRace ?? roundOneRace ?? nextUpcomingRace ?? null;
  }, [parsedRound, calendar, liveRace, lastCompletedRace, roundOneRace, nextUpcomingRace]);

  const hasLastRace = Boolean(targetRace);
  const lastYear = targetRace?.year ?? scheduleYear;
  const lastRound = targetRace?.round ?? parsedRound ?? 1;
  const hasCompletedRace = targetRace?.status === "completed";

  // ── Last race detail + results ─────────────────────────────────────────
  const { data: raceDetail, isLoading: raceDetailLoading } = useRaceDetail(lastYear, lastRound, hasLastRace);
  const { data: results, isLoading: resultsLoading } = useRaceResults(lastYear, lastRound, hasCompletedRace);
  const { data: weather } = useRaceWeather(lastYear, lastRound, hasCompletedRace);
  const { data: incidents } = useRaceIncidents(lastYear, lastRound, hasCompletedRace);
  const { data: qualiResults } = useQualifyingResults(lastYear, lastRound, hasCompletedRace);

  // ── Standings ──────────────────────────────────────────────────────────
  const { data: standings, isLoading: standingsLoading } = useDriverStandings(scheduleYear);
  const { data: constructors, isLoading: constructorsLoading } = useConstructorStandings(scheduleYear);

  const isRestoring = useIsRestoring();

  const lastRace = {
    data: raceDetail,
    loading: scheduleLoading || raceDetailLoading || isRestoring,
    error: undefined,
    reload: () => {},
  };

  const lastResults = { data: results, loading: resultsLoading || isRestoring };

  const pushSelection = (year: number, round?: number) => {
    const params = new URLSearchParams();
    params.set("year", String(year));
    if (typeof round === "number") {
      params.set("round", String(round));
    }
    const url = `/?${params.toString()}`;

    // Update store for instant UI and update URL without navigation
    setHomeYear(year);
    if (typeof round === "number") setHomeRound(round);
    else setHomeRound(null);
    window.history.replaceState(null, "", url);
  };

  const handlePrevYear = () => pushSelection(scheduleYear - 1);
  const handleNextYear = () => pushSelection(scheduleYear + 1);

  const handlePrevRound = () => {
    if (calendar && targetRace?.round && targetRace.round > 1) {
      const prevRound = targetRace.round - 1;
      pushSelection(scheduleYear, prevRound);
    }
  };

  const handleNextRound = () => {
    if (calendar && targetRace?.round && targetRace.round < calendar.length) {
      const nextRound = targetRace.round + 1;
      pushSelection(scheduleYear, nextRound);
    }
  };

  return (
    <main className="min-h-screen w-full page-shell">
   
      <StatusStrip
        calendar={calendar}
        leader={standings?.[0]}
        hasError={Boolean(lastRace.error)}
        onRetry={lastRace.reload}
        year={scheduleYear}
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-display text-3xl font-bold tracking-tight">Race Control</h1>
          <ArrowSlider
            label="Year"
            value={String(scheduleYear)}
            onPrev={handlePrevYear}
            onNext={handleNextYear}
            prevDisabled={scheduleYear <= 1950}
            nextDisabled={scheduleYear >= CURRENT_YEAR}
          />
          <ArrowSlider
            label="Race"
            value={targetRace ? `R${targetRace.round} · ${targetRace.shortName}` : "Select Race"}
            onPrev={handlePrevRound}
            onNext={handleNextRound}
            disabled={!calendar}
            prevDisabled={!calendar || !targetRace?.round || targetRace.round <= 1}
            nextDisabled={!calendar || !targetRace?.round || targetRace.round >= calendar.length}
          />
        </div>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LastRacePanel
            race={lastRace.data}
            results={lastResults.data}
            qualiResults={qualiResults}
            incidents={incidents}
            weather={weather}
            loading={lastRace.loading || lastResults.loading}
          />
        </div>

        <RightColumnPanels
          year={scheduleYear}
          nextRace={nextUpcomingRace}
          nextRaceLoading={scheduleLoading || isRestoring}
          standings={standings}
          standingsLoading={standingsLoading || isRestoring}
          constructors={constructors}
          constructorsLoading={constructorsLoading || isRestoring}
        />
      </div>

      <CalendarStripPanel calendar={calendar} loading={scheduleLoading || isRestoring} year={scheduleYear} />
    </main>
  );
};
