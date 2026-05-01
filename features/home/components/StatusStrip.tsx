'use client';

import { DriverCode } from "@/components/DriverCode";
import { ErrorPanel } from "@/components/EmptyState";
import type { DriverStanding, Race } from "@/types/ui";

type StatusStripProps = {
  calendar: Race[] | undefined;
  leader: DriverStanding | undefined;
  hasError: boolean;
  onRetry: () => void;
};

export const StatusStrip = ({ calendar, leader, hasError, onRetry }: StatusStripProps) => {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-sm border border-border-subtle bg-panel px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2">
        <span className="label-mono">SEASON 2024</span>
        {calendar && (
          <span className="font-mono text-xs">
            ROUND <span className="text-text">{calendar.filter(r => r.status === "completed").length}</span>
            <span className="text-muted">/{calendar.length}</span>
          </span>
        )}
        {leader && (
          <span className="font-mono text-xs">
            LEADER <DriverCode driver={leader.driver} className="text-text" /> · {leader.points} PTS
          </span>
        )}
      </div>
      {hasError && <ErrorPanel onRetry={onRetry} />}
    </header>
  );
};
