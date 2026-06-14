/**
 * Simple phase detection utilities.
 * These are intentionally conservative and pure so they are easy to test.
 */

export type PhaseBand = { name: "early" | "mid" | "late"; startLap: number; endLap: number };

export function detectPhasesByLapCount(totalLaps: number): PhaseBand[] {
  if (!Number.isFinite(totalLaps) || totalLaps <= 0) return [];
  const per = Math.max(1, Math.floor(totalLaps / 3));
  const firstEnd = per;
  const secondEnd = Math.min(per * 2, totalLaps);
  const bands: PhaseBand[] = [
    { name: "early", startLap: 1, endLap: firstEnd },
    { name: "mid", startLap: firstEnd + 1, endLap: secondEnd },
    { name: "late", startLap: secondEnd + 1, endLap: totalLaps },
  ];
  return bands.filter((b) => b.startLap <= b.endLap);
}

export function detectPhasesFromLapArray(laps: Array<{ lap?: number }>): PhaseBand[] {
  const total = laps && laps.length ? Math.max(...laps.map((l) => Number(l.lap ?? 0))) : 0;
  return detectPhasesByLapCount(total);
}
