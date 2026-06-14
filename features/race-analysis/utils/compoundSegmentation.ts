/**
 * Utilities to segment consecutive laps by tyre compound.
 */

export type CompoundSegment<T = any> = {
  compound: string | null;
  startLap: number;
  endLap: number;
  laps: T[];
};

export function segmentByCompound<T extends { lap?: number; compound?: string }>(rows: T[]): CompoundSegment<T>[] {
  if (!rows || rows.length === 0) return [];
  const segments: CompoundSegment<T>[] = [];
  let current: CompoundSegment<T> | null = null;

  for (const r of rows) {
    const compound = r.compound ?? null;
    const lap = Number(r.lap ?? (r as any).lapNumber ?? (r as any).lap ?? 0) || 0;
    if (!current || current.compound !== compound) {
      if (current) segments.push(current);
      current = { compound, startLap: lap, endLap: lap, laps: [r] };
    } else {
      current.endLap = lap;
      current.laps.push(r);
    }
  }
  if (current) segments.push(current);
  return segments;
}
