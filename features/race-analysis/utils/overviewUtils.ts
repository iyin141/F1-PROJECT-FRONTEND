import { DRIVERS } from "@/Lib/data/drivers";
import type { Driver, Compound, ConsistencyScore } from "@/types/ui";
import { calculateConsistencyMetrics } from "@/Lib/adapters";

export type Range = { startLap: number; endLap: number; label: string };
export type LapRow = {
  driverCode: string;
  lapNumber: number;
  lapTimeMs: number | null;
  sector1Ms?: number | null;
  sector2Ms?: number | null;
  sector3Ms?: number | null;
  compound?: string | null;
};

export type RangeMetrics = {
  driverCode: string;
  avgLapMs: number | null;
  avgSectorMs: number | null;
  compoundsUsed: string[];
  lapCount: number;
  bestLapMs: number | null;
};

function stubDriverFromCode(code: string): Driver {
  return {
    id: code.toLowerCase(),
    code,
    number: 0,
    firstName: code,
    lastName: "",
    team: "haas",
  } as Driver;
}

export function computeRanges(totalLaps: number, parts = 3): Range[] {
  if (!totalLaps || totalLaps <= 0) return [];
  if (totalLaps <= parts) {
    return Array.from({ length: totalLaps }, (_, i) => ({
      startLap: i + 1,
      endLap: i + 1,
      label: `Lap ${i + 1}`,
    }));
  }

  const base = Math.floor(totalLaps / parts);
  const remainder = totalLaps - base * parts;
  const ranges: Range[] = [];
  let start = 1;
  for (let i = 0; i < parts; i++) {
    let end = start + base - 1;
    if (i === parts - 1) end += remainder; // extend remainder onto final range
    ranges.push({ startLap: start, endLap: end, label: `Laps ${start}–${end}` });
    start = end + 1;
  }
  return ranges;
}

export function aggregateDriverMetricsByRange(
  lapsByDriver: Record<string, LapRow[]>,
  ranges: Range[],
): Record<string, RangeMetrics[]> {
  const out: Record<string, RangeMetrics[]> = {};
  for (const driverCode of Object.keys(lapsByDriver)) {
    const rows = lapsByDriver[driverCode] || [];
    out[driverCode] = ranges.map((r) => {
      const sel = rows.filter((x) => x.lapNumber >= r.startLap && x.lapNumber <= r.endLap && x.lapTimeMs != null);
      const lapCount = sel.length;
      if (!lapCount) {
        return { driverCode, avgLapMs: null, avgSectorMs: null, compoundsUsed: [], lapCount: 0, bestLapMs: null };
      }
      const lapSum = sel.reduce((s, v) => s + (v.lapTimeMs ?? 0), 0);
      const avgLapMs = lapSum / lapCount;

      let sectorTotal = 0;
      let sectorCount = 0;
      for (const s of sel) {
        if (s.sector1Ms != null) { sectorTotal += s.sector1Ms; sectorCount++; }
        if (s.sector2Ms != null) { sectorTotal += s.sector2Ms; sectorCount++; }
        if (s.sector3Ms != null) { sectorTotal += s.sector3Ms; sectorCount++; }
      }
      const avgSectorMs = sectorCount ? sectorTotal / sectorCount : null;

      const compoundsSet = new Set<string>();
      for (const s of sel) if (s.compound) compoundsSet.add(String(s.compound));
      const compoundsUsed = Array.from(compoundsSet);

      const bestLapMs = sel.reduce((m, v) => (m == null ? v.lapTimeMs ?? null : Math.min(m, v.lapTimeMs ?? m)), null as number | null);

      return { driverCode, avgLapMs, avgSectorMs, compoundsUsed, lapCount, bestLapMs };
    });
  }
  return out;
}

export function computeTopNPerRange(metricsByDriver: Record<string, RangeMetrics[]>, n = 3) {
  const driverCodes = Object.keys(metricsByDriver);
  if (!driverCodes.length) return [] as any[];
  const rangeCount = metricsByDriver[driverCodes[0]].length;
  const out: any[] = [];
  for (let i = 0; i < rangeCount; i++) {
    const candidates = driverCodes
      .map((code) => ({ code, m: metricsByDriver[code][i] }))
      .filter((d) => d.m && d.m.lapCount > 0 && d.m.avgLapMs != null)
      .sort((a, b) => {
        if (a.m.avgLapMs! !== b.m.avgLapMs!) return a.m.avgLapMs! - b.m.avgLapMs!;
        if ((a.m.bestLapMs ?? 0) !== (b.m.bestLapMs ?? 0)) return (a.m.bestLapMs ?? 0) - (b.m.bestLapMs ?? 0);
        return a.code.localeCompare(b.code);
      })
      .slice(0, n)
      .map((d) => ({ ...d.m }));
    out.push(candidates);
  }
  return out;
}

export function computeConsistencyByRange(lapsByDriver: Record<string, LapRow[]>, ranges: Range[]) {
  const out: ConsistencyScore[][] = ranges.map(() => []);
  for (let ri = 0; ri < ranges.length; ri++) {
    const r = ranges[ri];
    for (const driverCode of Object.keys(lapsByDriver)) {
      const allSel = lapsByDriver[driverCode]
        .filter((x) => x.lapNumber >= r.startLap && x.lapNumber <= r.endLap && x.lapTimeMs != null)
        .map((x) => x.lapTimeMs ?? 0);
        
      const metrics = calculateConsistencyMetrics(allSel);
      if (!metrics) continue;

      // top compound
      const compounds: Record<string, number> = {};
      for (const lap of lapsByDriver[driverCode].filter((x) => x.lapNumber >= r.startLap && x.lapNumber <= r.endLap)) {
        if (lap.compound) compounds[String(lap.compound)] = (compounds[String(lap.compound)] ?? 0) + 1;
      }
      const topCompound = Object.keys(compounds).sort((a, b) => (compounds[b] - compounds[a]))[0] as Compound | undefined;
      const driver = DRIVERS.find((d) => d.code === driverCode) ?? stubDriverFromCode(driverCode);
      out[ri].push({ 
        driver, 
        score: metrics.score, 
        bestLapMs: metrics.bestLapMs, 
        avgLapMs: metrics.avgLapMs, 
        topCompound: (topCompound as Compound) ?? ("medium" as Compound) 
      });
    }
    // sort ascending by average lap time
    out[ri].sort((a, b) => a.avgLapMs - b.avgLapMs);
  }
  return out;
}
