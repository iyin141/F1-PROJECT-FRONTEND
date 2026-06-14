'use client';

import { useMemo } from "react";
import Skeleton from "@/components/animations/Skeleton";
import { useDriverPace } from "@/features/race-analysis/hooks/useRaceAnalysis";
import { formatLapMs } from "@/Lib/format";

export const DriverPacePanel = ({
  year,
  round,
  driverId,
}: {
  year: number;
  round: number;
  driverId?: string;
}) => {
  const { data, isLoading } = useDriverPace(year, round, driverId);

  const stats = useMemo(() => {
    if (!data || !data.data || data.data.length === 0) return null;

    const rows = data.data;
    // avg_pace, min_pace, max_pace are NumericString - parse as seconds then convert to ms
    const paceMs = (parseFloat(rows[0]?.avg_pace ?? "0") || 0) * 1000;
    const minMs = (parseFloat(rows[0]?.min_pace ?? rows[0]?.avg_pace ?? "0") || paceMs) * 1000;
    const maxMs = (parseFloat(rows[0]?.max_pace ?? rows[0]?.avg_pace ?? "0") || paceMs) * 1000;
    const lapCount = rows[0]?.lap_count ?? 0;

    return {
      pace: paceMs,
      min: minMs,
      max: maxMs,
      lapCount,
      variance: lapCount > 0 && paceMs > 0 ? ((maxMs - minMs) / paceMs) * 100 : 0,
    };
  }, [data]);

  if (isLoading) return <Skeleton height={256} />;
  if (!stats) return <div className="text-muted text-sm">No data</div>;

  return (
    <div className="space-y-4">
      {/* Race pace */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-border-subtle px-3 py-2">
          <div className="text-[9px] uppercase tracking-[0.1em] text-muted mb-1">
            Avg Pace
          </div>
          <div className="font-mono text-lg font-bold">{formatLapMs(stats.pace)}</div>
        </div>
        <div className="border border-border-subtle px-3 py-2">
          <div className="text-[9px] uppercase tracking-[0.1em] text-muted mb-1">
            Laps
          </div>
          <div className="font-mono text-lg font-bold">{stats.lapCount}</div>
        </div>
      </div>

      {/* Min/Avg/Max */}
      <div className="grid grid-cols-3 gap-2">
        <div className="border border-border-subtle px-2 py-2">
          <div className="text-[8px] uppercase tracking-[0.1em] text-muted mb-1">
            Min
          </div>
          <div className="font-mono text-sm font-bold">{formatLapMs(stats.min)}</div>
        </div>
        <div className="border border-border-subtle px-2 py-2">
          <div className="text-[8px] uppercase tracking-[0.1em] text-muted mb-1">
            Avg
          </div>
          <div className="font-mono text-sm font-bold">{formatLapMs(stats.pace)}</div>
        </div>
        <div className="border border-border-subtle px-2 py-2">
          <div className="text-[8px] uppercase tracking-[0.1em] text-muted mb-1">
            Max
          </div>
          <div className="font-mono text-sm font-bold">{formatLapMs(stats.max)}</div>
        </div>
      </div>

      {/* Pace variance */}
      <div className="border border-border-subtle px-3 py-2">
        <div className="text-[9px] uppercase tracking-[0.1em] text-muted mb-1">
          Variance %
        </div>
        <div className="font-mono text-base font-bold">{stats.variance.toFixed(1)}%</div>
      </div>
    </div>
  );
};
