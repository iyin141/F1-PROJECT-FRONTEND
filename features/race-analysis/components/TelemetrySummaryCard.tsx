'use client';

import { useMemo } from "react";
import { useTelemetrySummary } from "@/features/race-analysis/hooks/useRaceAnalysis";

export const TelemetrySummaryCard = ({
  year,
  round,
  driverId,
  lap,
  session = "R",
}: {
  year: number;
  round: number;
  driverId?: string;
  lap: number | null;
  session?: "R" | "Q" | "FP1" | "FP2" | "FP3";
}) => {
  const { data, isLoading } = useTelemetrySummary(year, round, driverId, lap, session);

  const stats = useMemo(() => {
    if (!data || !data.data) return null;

    const telemetry = data.data;
    const isLegacy = !Array.isArray(telemetry);

    if (isLegacy) {
      // TelemetrySummaryLegacyData format
      return {
        speedMin: telemetry.min_speed,
        speedMax: telemetry.max_speed,
        speedAvg: telemetry.avg_speed,
        throttleAvg: (telemetry.avg_throttle * 100).toFixed(1),
        brakeAvg: (telemetry.max_brake * 100).toFixed(1),
        gearChanges: telemetry.gear_changes,
      };
    }

    // TelemetrySummaryLap[] format - aggregate
    const laps = telemetry as any[];
    if (laps.length === 0) return null;
    const speedAvg =
      laps.reduce((sum, l) => sum + (l.avg_speed ?? 0), 0) / laps.length;
    const speedMax = Math.max(...laps.map((l) => l.max_speed ?? 0));
    const speedMin = Math.min(...laps.map((l) => l.min_speed ?? speedMax));
    const throttleAvg =
      laps.reduce((sum, l) => sum + (l.avg_throttle ?? 0), 0) / laps.length;
    const brakeEvents = laps.reduce((sum, l) => sum + (l.brake_events ?? 0), 0);
    const gearChanges = laps.reduce((sum, l) => sum + (l.gear_changes ?? 0), 0);

    return {
      speedMin: Math.round(speedMin),
      speedMax: Math.round(speedMax),
      speedAvg,
      throttleAvg: (throttleAvg * 100).toFixed(1),
      brakeAvg: (brakeEvents / Math.max(1, laps.length)).toFixed(1),
      gearChanges,
    };
  }, [data]);

  if (isLoading) return <div className="h-48" />;
  if (!stats) return <div className="text-muted text-sm">No data</div>;

  return (
    <div className="space-y-3">
      {/* Speed */}
      <div className="grid grid-cols-3 gap-2">
        <div className="border border-border-subtle px-2 py-2">
          <div className="text-[8px] uppercase tracking-[0.1em] text-muted mb-1">
            Min
          </div>
          <div className="font-mono text-sm font-bold">{stats.speedMin}</div>
          <div className="text-[8px] text-muted">km/h</div>
        </div>
        <div className="border border-border-subtle px-2 py-2">
          <div className="text-[8px] uppercase tracking-[0.1em] text-muted mb-1">
            Avg
          </div>
          <div className="font-mono text-sm font-bold">
            {Math.round(stats.speedAvg)}
          </div>
          <div className="text-[8px] text-muted">km/h</div>
        </div>
        <div className="border border-border-subtle px-2 py-2">
          <div className="text-[8px] uppercase tracking-[0.1em] text-muted mb-1">
            Max
          </div>
          <div className="font-mono text-sm font-bold">{stats.speedMax}</div>
          <div className="text-[8px] text-muted">km/h</div>
        </div>
      </div>

      {/* Throttle & Brake */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-border-subtle px-2 py-2">
          <div className="text-[8px] uppercase tracking-[0.1em] text-muted mb-1">
            Throttle Avg
          </div>
          <div className="font-mono text-sm font-bold">{stats.throttleAvg}%</div>
        </div>
        <div className="border border-border-subtle px-2 py-2">
          <div className="text-[8px] uppercase tracking-[0.1em] text-muted mb-1">
            Brake Events
          </div>
          <div className="font-mono text-sm font-bold">{stats.brakeAvg}</div>
        </div>
      </div>

      {/* Gear Changes */}
      <div className="border border-border-subtle px-2 py-2">
        <div className="text-[8px] uppercase tracking-[0.1em] text-muted mb-1">
          Gear Changes
        </div>
        <div className="font-mono text-sm font-bold">{stats.gearChanges}</div>
      </div>
    </div>
  );
};
