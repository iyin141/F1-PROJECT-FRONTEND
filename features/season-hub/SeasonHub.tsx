'use client';

import { useState } from "react";
import { CalendarPanel } from "@/features/season-hub/components/CalendarPanel";
import { SeasonHeader } from "@/features/season-hub/components/SeasonHeader";
import { StandingsPanel } from "@/features/season-hub/components/StandingsPanel";
import {
  useSeasonSchedule,
  useDriverStandings,
  useConstructorStandings,
} from "@/features/season-hub/hooks/useSeasonHub";
import {
  adaptSeasonSchedule,
  adaptDriverStandings,
  adaptConstructorStandings,
} from "@/Lib/adapters";

type SeasonHubShellProps = {
  year: number;
  onYearChange: (year: number) => void;
};

export const SeasonHubShell = ({ year, onYearChange }: SeasonHubShellProps) => {
  const { data: scheduleData, isLoading: scheduleLoading } = useSeasonSchedule(year);
  const { data: driversData, isLoading: driversLoading } = useDriverStandings(year);
  const { data: constructorsData, isLoading: constructorsLoading } = useConstructorStandings(year);

  const calendar = {
    data: scheduleData ? adaptSeasonSchedule(scheduleData) : undefined,
    loading: scheduleLoading,
  };
  const drivers = {
    data: driversData ? adaptDriverStandings(driversData) : undefined,
    loading: driversLoading,
  };
  const constructors = {
    data: constructorsData ? adaptConstructorStandings(constructorsData) : undefined,
    loading: constructorsLoading,
  };
  const years: { data: number[] | undefined; loading: boolean } = { data: undefined, loading: false };

  const [view] = useState<"list" | "grid">("list");

  return (
    <main className="page-shell w-full">
      <SeasonHeader year={year} years={years.data} onYearChange={onYearChange} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CalendarPanel
            year={year}
            calendar={calendar.data}
            loading={calendar.loading}
            view={view}
          />
        </div>

        <div className="self-start space-y-6 lg:sticky lg:top-6">
          <StandingsPanel
            year={year}
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
