'use client';

import { useState, useEffect } from "react";
import { CalendarPanel } from "@/features/season-hub/components/CalendarPanel";
import { SeasonHeader } from "@/features/season-hub/components/SeasonHeader";
import { StandingsPanel } from "@/features/season-hub/components/StandingsPanel";
import { useSeasonSchedule, useDriverStandings, useConstructorStandings } from "@/features/season-hub/hooks/useSeasonHub";
import { useNavStore } from "@/_Stores/navStore";

type SeasonHubShellProps = {
  year: number;
};

export const SeasonHubShell = ({ year }: SeasonHubShellProps) => {
  const setSeasonYear = useNavStore((s) => s.setSeasonYear);
  const storeSeasonYear = useNavStore((s) => s.seasonYear);

  // Seed store with the page prop on mount
  useEffect(() => {
    setSeasonYear(year);
  }, [year, setSeasonYear]);

  const effectiveYear = storeSeasonYear ?? year;

  const { data: scheduleData, isLoading: scheduleLoading, isFetching: scheduleFetching } = useSeasonSchedule(effectiveYear);
  const { data: driversData, isLoading: driversLoading, isFetching: driversFetching } = useDriverStandings(effectiveYear);
  const { data: constructorsData, isLoading: constructorsLoading, isFetching: constructorsFetching } = useConstructorStandings(effectiveYear);

  const calendar = { data: scheduleData, loading: scheduleLoading || (!scheduleData && scheduleFetching) };
  const drivers = { data: driversData, loading: driversLoading || (!driversData && driversFetching) };
  const constructors = { data: constructorsData, loading: constructorsLoading || (!constructorsData && constructorsFetching) };
  const years: { data: number[] | undefined; loading: boolean } = { data: undefined, loading: false };

  const [view] = useState<"list" | "grid">("list");

  const onNavigate = (nextYear: number) => {
    setSeasonYear(nextYear);
    const nextPath = `/season/${nextYear}`;
    window.history.replaceState(null, "", nextPath);
  };

  return (
    <main className="page-shell w-full">
      <SeasonHeader year={effectiveYear} years={years.data} onNavigate={onNavigate} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CalendarPanel
            year={effectiveYear}
            calendar={calendar.data}
            loading={calendar.loading}
            view={view}
          />
        </div>

        <div className="self-start space-y-6 lg:sticky lg:top-6">
          <StandingsPanel
            year={effectiveYear}
            drivers={drivers.data}
            driversLoading={drivers.loading}
            constructors={constructors.data}
            constructorsLoading={constructors.loading}
          />
        </div>
      </div>
    </main>
  );
};
