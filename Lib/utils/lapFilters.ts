import { timeStringToSeconds } from "@/Lib/utils/timeConvert";
import type { AnalysisLapRow } from "@/types/endpoints/lapstypes";

/** Remove laps with null/invalid lap_time values. */
export function filterValidLaps(laps: AnalysisLapRow[] | undefined): AnalysisLapRow[] {
  if (!laps || !laps.length) return [];
  return laps.filter((r) => r.lap_time !== null && timeStringToSeconds(r.lap_time) !== null);
}

/** Compute the personal best (seconds) for a driver from a laps array. */
export function getDriverPersonalBest(laps: AnalysisLapRow[], driverCode: string): number | null {
  const driverLaps = laps.filter((r) => r.driver_code === driverCode && r.lap_time !== null);
  const secs = driverLaps
    .map((r) => timeStringToSeconds(r.lap_time as string))
    .filter((v): v is number => v !== null && v !== undefined);
  if (!secs.length) return null;
  return Math.min(...secs);
}

/**
 * Remove outlier laps for each driver using a multiplier on their personal best.
 * Default multiplier is 1.15 (laps slower than 115% of PB are considered outliers).
 */
export function filterOutlierLaps(laps: AnalysisLapRow[] | undefined, multiplier = 1.15): AnalysisLapRow[] {
  if (!laps || !laps.length) return [];
  const drivers = Array.from(new Set(laps.map((r) => r.driver_code)));
  const pbMap: Record<string, number | null> = {};
  for (const d of drivers) pbMap[d] = getDriverPersonalBest(laps, d);

  return laps.filter((r) => {
    if (r.lap_time === null) return false;
    const secs = timeStringToSeconds(r.lap_time as string);
    if (secs === null) return false;
    const pb = pbMap[r.driver_code];
    if (pb === null || pb === undefined) return true; // keep if no PB
    return secs <= pb * multiplier;
  });
}

export default { filterValidLaps, getDriverPersonalBest, filterOutlierLaps };
