'use client';

import { useMemo } from "react";
import { useTrackStatus } from "@/features/race-detail/hooks/useRaceDetail";

const STATUS_COLORS: Record<string, string> = {
  green: "hsl(var(--green))",
  yellow: "hsl(var(--amber))",
  red: "hsl(var(--red))",
  safety_car: "hsl(var(--blue))",
  virtual_safety_car: "hsl(var(--blue))",
};

const getStatusColor = (status: string): string => {
  const lower = status.toLowerCase();
  return STATUS_COLORS[lower] ?? "hsl(var(--text-dim))";
};

export const TrackStatusPanel = ({
  year,
  round,
}: {
  year: number;
  round: number;
}) => {
  const { data, isLoading } = useTrackStatus(year, round);

  const stats = useMemo(() => {
    if (!data || !data.data || data.data.length === 0) return null;

    const statusEvents = data.data;
    const statusCount = new Map<string, number>();
    let safetyCarCount = 0;

    for (const event of statusEvents) {
      const status = event.status || "unknown";
      const count = (statusCount.get(status) ?? 0) + 1;
      statusCount.set(status, count);

      if (
        status.toLowerCase().includes("safety") ||
        status.toLowerCase().includes("red")
      ) {
        safetyCarCount += 1;
      }
    }

    // Convert to array and sort by frequency
    const statuses = Array.from(statusCount.entries()).sort((a, b) => b[1] - a[1]);

    return {
      totalEvents: statusEvents.length,
      statuses,
      safetyCarCount,
    };
  }, [data]);

  if (isLoading) return <div className="h-48" />;
  if (!stats) return <div className="text-muted text-sm">No track status data</div>;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-border-subtle px-3 py-2">
          <div className="text-[9px] uppercase tracking-[0.1em] text-muted mb-1">
            Status Events
          </div>
          <div className="font-mono text-lg font-bold">{stats.totalEvents}</div>
        </div>
        <div className="border border-border-subtle px-3 py-2">
          <div className="text-[9px] uppercase tracking-[0.1em] text-muted mb-1">
            Red/Safety
          </div>
          <div className="font-mono text-lg font-bold">
            {stats.safetyCarCount}
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="border border-border-subtle">
        <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted border-b border-border-subtle">
          Status Types
        </div>
        <div className="space-y-1">
          {stats.statuses.slice(0, 5).map(([status, count]) => (
            <div
              key={status}
              className="flex items-center justify-between px-3 py-1.5 font-mono text-sm border-b border-border-subtle last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 border border-border-subtle"
                  style={{ backgroundColor: getStatusColor(status) }}
                />
                <span className="capitalize">
                  {status.replace(/_/g, " ").toLowerCase()}
                </span>
              </div>
              <span className="text-muted">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
