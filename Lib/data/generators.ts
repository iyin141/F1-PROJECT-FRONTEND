import type { RaceResult, QualifyingResult, PracticeResult, LapTime, Stint, SectorAnalysis, Incident, WeatherSnapshot, DriverStanding, ConstructorStanding, Compound, ReplayFrame, ReplayPosition, FlagType } from "@/types/ui";
import { DRIVERS, TEAMS, driverById } from "./drivers";

// Deterministic pseudo-random based on seed
const seedRand = (seed: number) => {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};

export const generateRaceResults = (year: number, round: number): RaceResult[] => {
  const rng = seedRand(year * 100 + round);
  // Bias top teams to front
  const ordered = [...DRIVERS].sort((a, b) => {
    const teamRank: Record<string, number> = {
      "red-bull": 0, "mclaren": 1, "ferrari": 2, "mercedes": 3,
      "aston-martin": 4, "rb": 5, "haas": 6, "alpine": 7, "williams": 8, "sauber": 9,
    };
    return teamRank[a.team] - teamRank[b.team] + (rng() - 0.5) * 3;
  });
  const points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  let baseTime = 5400; // ms gap accumulator
  return ordered.map((driver, i) => {
    baseTime += 800 + rng() * 4000;
    const dnf = i >= 18 && rng() > 0.6;
    return {
      position: dnf ? "DNF" : i + 1,
      driver,
      laps: dnf ? Math.floor(rng() * 50) : 57,
      time: i === 0 ? "1:32:18.456" : `+${(baseTime / 1000).toFixed(3)}`,
      gap: i === 0 ? "—" : `+${(baseTime / 1000).toFixed(3)}`,
      points: points[i] ?? 0,
      fastestLap: i === Math.floor(rng() * 5),
      status: dnf ? "Collision" : "Finished",
      startGrid: Math.max(1, Math.min(20, i + Math.floor((rng() - 0.5) * 4))),
    } as RaceResult;
  });
};

const formatLap = (ms: number) => {
  const m = Math.floor(ms / 60000);
  const s = ((ms % 60000) / 1000).toFixed(3);
  return `${m}:${s.padStart(6, "0")}`;
};

export const generateQualifying = (year: number, round: number): QualifyingResult[] => {
  const rng = seedRand(year * 100 + round + 7);
  const results = generateRaceResults(year, round);
  return results.slice(0, 20).map((r, i) => {
    const base = 88000 + i * 120 + rng() * 80;
    return {
      position: i + 1,
      driver: r.driver,
      q1: i < 15 ? formatLap(base + 1200) : formatLap(base + 1200),
      q2: i < 10 ? formatLap(base + 600) : undefined,
      q3: i < 10 ? formatLap(base) : undefined,
      bestSector1: 22000 + rng() * 400,
      bestSector2: 28000 + rng() * 500,
      bestSector3: 38000 + rng() * 600,
    };
  });
};

export const generatePractice = (year: number, round: number, session: "fp1"|"fp2"|"fp3"): PracticeResult[] => {
  const rng = seedRand(year * 100 + round + (session === "fp1" ? 1 : session === "fp2" ? 2 : 3));
  const compounds: Compound[] = ["soft", "medium", "hard"];
  return [...DRIVERS].sort(() => rng() - 0.5).slice(0, 20).map((driver, i) => {
    const ms = 89000 + i * 150 + rng() * 200;
    return {
      position: i + 1,
      driver,
      bestLap: formatLap(ms),
      laps: 18 + Math.floor(rng() * 20),
      gap: i === 0 ? "—" : `+${((ms - 89000) / 1000).toFixed(3)}`,
      compound: compounds[Math.floor(rng() * 3)],
    };
  });
};

export const generateLapTimes = (year: number, round: number): LapTime[] => {
  const rng = seedRand(year * 100 + round + 11);
  const out: LapTime[] = [];
  const totalLaps = 57;
  for (let lap = 1; lap <= totalLaps; lap++) {
    DRIVERS.forEach((d, idx) => {
      const compound: Compound = lap < 20 ? "medium" : lap < 40 ? "hard" : "soft";
      out.push({
        lap, driverId: d.id,
        timeMs: 92000 + idx * 100 + rng() * 1500 + (lap < 5 ? 4000 : 0),
        position: idx + 1, compound,
        pit: (lap === 19 || lap === 39) && idx < 18,
      });
    });
  }
  return out;
};

export const generateStints = (year: number, round: number): Stint[] => {
  const rng = seedRand(year * 100 + round + 13);
  const stints: Stint[] = [];
  const compounds: Compound[] = ["soft", "medium", "hard"];
  DRIVERS.forEach(d => {
    const numStints = 2 + Math.floor(rng() * 2);
    let lap = 1;
    for (let s = 0; s < numStints; s++) {
      const stintLen = Math.floor(57 / numStints) + Math.floor((rng() - 0.5) * 6);
      const end = Math.min(57, lap + stintLen);
      stints.push({
        driverId: d.id, stintNumber: s + 1,
        startLap: lap, endLap: end,
        compound: compounds[(s + Math.floor(rng() * 3)) % 3],
        avgPaceMs: 93000 + rng() * 2500,
      });
      lap = end + 1;
      if (lap > 57) break;
    }
  });
  return stints;
};

export const generateSectors = (year: number, round: number): SectorAnalysis[] => {
  const rng = seedRand(year * 100 + round + 17);
  return DRIVERS.map((d, i) => ({
    driverId: d.id,
    s1Ms: 22000 + i * 50 + rng() * 600,
    s2Ms: 28000 + i * 80 + rng() * 700,
    s3Ms: 38000 + i * 90 + rng() * 800,
  }));
};

export const generateIncidents = (year: number, round: number): Incident[] => {
  const rng = seedRand(year * 100 + round + 19);
  const out: Incident[] = [];
  if (rng() > 0.4) out.push({ lap: Math.floor(rng() * 30) + 5, type: "SC", description: "Safety Car deployed — debris on main straight" });
  if (rng() > 0.6) out.push({ lap: Math.floor(rng() * 40) + 10, type: "VSC", description: "Virtual Safety Car — stranded car at Turn 4" });
  if (rng() > 0.5) out.push({ lap: Math.floor(rng() * 50) + 1, type: "Collision", description: "Lap-1 incident at Turn 1", drivers: ["SAR", "STR"] });
  return out.sort((a, b) => a.lap - b.lap);
};

export const generateWeather = (year: number, round: number): WeatherSnapshot => {
  const rng = seedRand(year * 100 + round + 23);
  return {
    airTempC: Math.round(18 + rng() * 18),
    trackTempC: Math.round(28 + rng() * 22),
    conditions: rng() > 0.85 ? "Wet" : rng() > 0.7 ? "Cloudy" : "Dry",
    windKph: Math.round(rng() * 25),
    humidity: Math.round(40 + rng() * 40),
  };
};

export const generateDriverStandings = (year: number, upToRound: number): DriverStanding[] => {
  const totals = new Map<string, { points: number; wins: number; podiums: number }>();
  DRIVERS.forEach(d => totals.set(d.id, { points: 0, wins: 0, podiums: 0 }));
  for (let r = 1; r <= upToRound; r++) {
    generateRaceResults(year, r).forEach(res => {
      const t = totals.get(res.driver.id)!;
      t.points += res.points;
      if (res.position === 1) t.wins += 1;
      if (typeof res.position === "number" && res.position <= 3) t.podiums += 1;
    });
  }
  const arr = DRIVERS.map(d => ({ driver: d, ...totals.get(d.id)! }))
    .sort((a, b) => b.points - a.points);
  const leader = arr[0]?.points ?? 0;
  return arr.map((row, i) => ({
    position: i + 1,
    driver: row.driver, points: row.points, wins: row.wins, podiums: row.podiums,
    gapToLeader: leader - row.points,
  }));
};

export const generateConstructorStandings = (year: number, upToRound: number): ConstructorStanding[] => {
  const drv = generateDriverStandings(year, upToRound);
  const teamPoints = new Map<string, { points: number; wins: number }>();
  Object.keys(TEAMS).forEach(t => teamPoints.set(t, { points: 0, wins: 0 }));
  drv.forEach(d => {
    const t = teamPoints.get(d.driver.team)!;
    t.points += d.points; t.wins += d.wins;
  });
  return [...teamPoints.entries()]
    .map(([id, v]) => ({ team: TEAMS[id as keyof typeof TEAMS], ...v }))
    .sort((a, b) => b.points - a.points)
    .map((r, i) => ({ position: i + 1, ...r }));
};

export const generateReplayFrames = (year: number, round: number): ReplayFrame[] => {
  const lapTimes = generateLapTimes(year, round);
  const stints = generateStints(year, round);
  const incidents = generateIncidents(year, round);
  const results = generateRaceResults(year, round);

  const dnfDriverIds = new Set(
    results.filter(r => r.position === "DNF").map(r => r.driver.id),
  );
  const fastestLapDriverId = results.find(r => r.fastestLap)?.driver.id ?? null;

  // Build flag map: lap number → flag type
  const flagMap = new Map<number, FlagType>();
  incidents.forEach(inc => {
    if (inc.type === "SC") {
      for (let l = inc.lap; l < Math.min(57, inc.lap + 4); l++) flagMap.set(l, "SC");
    } else if (inc.type === "VSC") {
      for (let l = inc.lap; l < Math.min(57, inc.lap + 2); l++) flagMap.set(l, "VSC");
    } else if (inc.type === "Red") {
      flagMap.set(inc.lap, "RED");
    }
  });

  const allLaps = [...new Set(lapTimes.map(l => l.lap))].sort((a, b) => a - b);
  const totalLaps = allLaps.length;

  return allLaps.map(lap => {
    const lapPositions = lapTimes
      .filter(l => l.lap === lap)
      .sort((a, b) => a.position - b.position);

    const positions: ReplayPosition[] = lapPositions
      .map((lp, idx) => {
        const driver = DRIVERS.find(d => d.id === lp.driverId);
        if (!driver) return null;

        const stint = stints.find(
          s => s.driverId === lp.driverId && s.startLap <= lap && s.endLap >= lap,
        );
        const tyreLap = stint ? lap - stint.startLap + 1 : 1;

        const gapSec = idx === 0 ? 0 : idx * 1.2;
        const intSec = idx === 0 ? 0 : 1.2;

        return {
          driver: driver.code,
          name: `${driver.firstName} ${driver.lastName}`,
          team: driver.team,
          gap: idx === 0 ? "LEADER" : `+${gapSec.toFixed(3)}s`,
          interval: idx === 0 ? "—" : `+${intSec.toFixed(3)}s`,
          tyre: lp.compound,
          tyreLap,
          inPit: lp.pit ?? false,
          dnf: dnfDriverIds.has(driver.id) && lap > 40,
          fastLap: driver.id === fastestLapDriverId && lap === totalLaps,
          pole: idx === 0 && lap === 1,
        } as ReplayPosition;
      })
      .filter(Boolean) as ReplayPosition[];

    return { lap, flag: flagMap.get(lap) ?? "GREEN", positions } as ReplayFrame;
  });
};
