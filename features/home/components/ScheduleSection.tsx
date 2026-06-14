"use client";

import { CalendarStripPanel } from "./CalendarStripPanel";
import { useSeasonSchedule } from "@/features/season-hub/hooks/useSeasonHub";

type ScheduleSectionProps = {
  year: number;
};

export function ScheduleSection({ year }: ScheduleSectionProps) {
  const { data: calendarRaces, isLoading } = useSeasonSchedule(year);

  return <CalendarStripPanel calendar={calendarRaces} loading={isLoading} year={year} />;
}
