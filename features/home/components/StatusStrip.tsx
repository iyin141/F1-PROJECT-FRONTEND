'use client';

import { DriverCode } from "@/components/DriverCode";
import { ErrorPanel } from "@/components/EmptyState";
import type { DriverStanding, Race } from "@/types/ui";
import { useDriverStandings } from "@/features/season-hub/hooks/useSeasonHub";

type StatusStripProps = {
  calendar: Race[] | undefined;
  leader: DriverStanding | undefined;
  hasError: boolean;
  onRetry: () => void;
  year?: number;
};

export const StatusStrip = ({ calendar, leader, hasError, onRetry, year }: StatusStripProps) => {
  const currentYear = year ?? new Date().getFullYear();
  const driverStandingsQuery = useDriverStandings(currentYear);
  const leaderFromQuery = driverStandingsQuery.data?.[0];
  const leaderData = leader ?? leaderFromQuery;
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-sm border border-border-subtle bg-panel px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2">
        <span className="label-mono">SEASON {year ?? new Date().getFullYear()}</span>
        {calendar && (
          <span className="font-mono text-xs">
            ROUND <span className="text-text">{calendar.filter(r => r.status === "completed").length}</span>
            <span className="text-muted">/{calendar.length}</span>
          </span>
        )}
        {leaderData && (
          <span className="font-mono text-xs">
            LEADER <DriverCode driver={leaderData.driver} className="text-text" /> · {leaderData.points} PTS
          </span>
        )}
      </div>
      {hasError && <ErrorPanel onRetry={onRetry} />}
    </header>
  );
};
