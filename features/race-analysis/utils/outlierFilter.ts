/**
 * Lightweight outlier filtering helpers for lap arrays.
 */

export function isPitLap(row: Record<string, any>): boolean {
  // common keys used by endpoints
  return !!(row.is_pit || row.pit || row.pit_stop || row.pitLap);
}

export function hasValidLapTime(row: Record<string, any>): boolean {
  const ms = Number(row.lap_time_ms ?? row.lapTimeMs ?? row.timeMs ?? row.lap_time ?? row.best_lap ?? NaN);
  return Number.isFinite(ms) && ms > 0;
}

export function filterOutlierLaps<T extends Record<string, any>>(rows: T[], options?: { allowPit?: boolean }): T[] {
  const allowPit = !!options?.allowPit;
  return rows.filter((r) => {
    if (!allowPit && isPitLap(r)) return false;
    if (!hasValidLapTime(r)) return false;
    return true;
  });
}
