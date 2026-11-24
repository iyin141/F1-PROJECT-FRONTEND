/**
 * Deterministic synthetic circuit and telemetry for mock mode.
 * Same shapes as A1's endpoints (docs/v2/progress/A1-trackmap.md): about 1,500 points on a uniform
 * distance grid, positions in 1/10 m, corners, 25 distance mini-sectors, DRS zones. No randomness,
 * so screenshots and Playwright runs are stable.
 */
import type {
  ColumnarTelemetry,
  DeltaResponse,
  MiniSectorScheme,
  MiniSectorsResponse,
  TelemetryChannel,
  TrackCorner,
  TrackMapResponse,
} from "@/Lib/api/v2/payloads";

const N = 1500;
const LENGTH_M = 5412;

function shape(t: number): [number, number, number] {
  const a = 2 * Math.PI * t;
  const r = 1 + 0.28 * Math.cos(2 * a + 0.4) + 0.14 * Math.sin(3 * a) + 0.06 * Math.cos(5 * a);
  return [r * Math.cos(a) * 1.35, r * Math.sin(a), 0.5 * Math.sin(2 * a) + 0.2 * Math.cos(a)];
}

function build() {
  // Dense sample, arc length, then resample on a uniform distance grid.
  const M = 8000;
  const px: number[] = [], py: number[] = [], pz: number[] = [], arc: number[] = [0];
  for (let i = 0; i <= M; i++) {
    const [x, y, z] = shape(i / M);
    px.push(x); py.push(y); pz.push(z);
    if (i) arc.push(arc[i - 1] + Math.hypot(x - px[i - 1], y - py[i - 1]));
  }
  const scale = LENGTH_M / arc[M];
  const x: number[] = [], y: number[] = [], z: number[] = [], distance: number[] = [];
  let j = 0;
  for (let i = 0; i < N; i++) {
    const d = (i / (N - 1)) * arc[M];
    while (j < M - 1 && arc[j + 1] < d) j++;
    const f = (d - arc[j]) / (arc[j + 1] - arc[j] || 1);
    x.push(+((px[j] + f * (px[j + 1] - px[j])) * scale * 10).toFixed(1));
    y.push(+((py[j] + f * (py[j + 1] - py[j])) * scale * 10).toFixed(1));
    z.push(+((pz[j] + f * (pz[j + 1] - pz[j])) * scale * 10).toFixed(1));
    distance.push(+((d * scale)).toFixed(2));
  }
  // Smoothed curvature from heading change.
  const head = x.map((_, i) => Math.atan2(y[Math.min(i + 1, N - 1)] - y[Math.max(i - 1, 0)], x[Math.min(i + 1, N - 1)] - x[Math.max(i - 1, 0)]));
  const curv = head.map((h, i) => {
    let dh = h - head[Math.max(i - 1, 0)];
    while (dh > Math.PI) dh -= 2 * Math.PI;
    while (dh < -Math.PI) dh += 2 * Math.PI;
    return Math.abs(dh);
  });
  const sm = curv.map((_, i) => {
    let s = 0, c = 0;
    for (let k = -12; k <= 12; k++) { const v = curv[i + k]; if (v !== undefined) { s += v; c++; } }
    return s / c;
  });
  return { x, y, z, distance, curv: sm };
}

const G = build();

/** Local maxima of curvature, at least 180 m apart, strongest 14, in lap order. */
function findCorners(): TrackCorner[] {
  const peaks: number[] = [];
  for (let i = 5; i < N - 5; i++) {
    if (G.curv[i] > 0.0085 && G.curv[i] >= G.curv[i - 1] && G.curv[i] > G.curv[i + 1]) peaks.push(i);
  }
  const strong = peaks.sort((a, b) => G.curv[b] - G.curv[a]);
  const chosen: number[] = [];
  for (const p of strong) if (chosen.every((c) => Math.abs(G.distance[c] - G.distance[p]) > 180) && chosen.length < 14) chosen.push(p);
  return chosen
    .sort((a, b) => a - b)
    .map((i, n) => ({
      number: n + 1,
      letter: "",
      angle: +(((G.curv[i] * 180) / Math.PI) * 40).toFixed(1),
      distance: G.distance[i],
      x: G.x[i],
      y: G.y[i],
    }));
}

export const CORNERS = findCorners();

function distanceBounds(n = 25): number[] {
  return Array.from({ length: n + 1 }, (_, i) => +((i * LENGTH_M) / n).toFixed(1));
}
function cornerBounds(): { boundaries: number[]; labels: string[] } {
  const d = CORNERS.map((c) => c.distance as number);
  const mids = d.slice(1).map((v, i) => +((v + d[i]) / 2).toFixed(1));
  // One sector per corner, cut at midpoints between neighbouring corners.
  return { boundaries: [0, ...mids, G.distance[N - 1]], labels: CORNERS.map((c) => `T${c.number}`) };
}

const DRS = [
  { start_m: 120.0, end_m: 760.0 },
  { start_m: 3480.0, end_m: 4310.0 },
];

export function trackMap(year: number, round: number, scheme: MiniSectorScheme): TrackMapResponse {
  const ms = scheme === "corners" ? cornerBounds() : { boundaries: distanceBounds() };
  return {
    meta: {
      year, round, scheme, circuit_key: 63, layout_hash: "mock0000layout", geometry_year: year,
      source: "mock fixture (synthetic circuit)", point_count: N, position_unit: "1/10 m",
    },
    points: { x: G.x, y: G.y, z: G.z, distance: G.distance },
    corners: CORNERS,
    mini_sectors: ms,
    drs_zones: DRS,
  };
}

// ---- synthetic laps -------------------------------------------------------------------------------

const PACE: Record<string, number> = { VER: 0, NOR: 0.0025, LEC: 0.0045, PIA: 0.006, HAM: 0.0075, RUS: 0.009, SAI: 0.011, ALO: 0.016 };

function target(i: number, skill: number): number {
  const c = G.curv[i];
  const v = c < 0.002 ? 335 : 335 - Math.min(255, (c - 0.002) * 21000);
  return Math.max(75, v) * (1 - skill);
}

/** Speed in km/h on the 1,500-point grid, with braking and acceleration limits so it has real shape. */
function speedProfile(driver: string): number[] {
  const skill = PACE[driver] ?? 0.02;
  const v = Array.from({ length: N }, (_, i) => target(i, skill));
  const step = LENGTH_M / (N - 1);
  const bright = 11, accel = 4.2; // m/s^2-ish, per metre limits
  for (let pass = 0; pass < 2; pass++) {
    for (let i = N - 2; i >= 0; i--) { // braking: cannot be faster than we can slow down to the next point
      const ms = v[i + 1] / 3.6;
      v[i] = Math.min(v[i], Math.sqrt(ms * ms + 2 * bright * step * 3.2) * 3.6);
    }
    for (let i = 1; i < N; i++) { // acceleration
      const ms = v[i - 1] / 3.6;
      v[i] = Math.min(v[i], Math.sqrt(ms * ms + 2 * accel * step * 3.2) * 3.6);
    }
  }
  return v;
}

type Lap = { driver: string; lapNumber: number; speed: number[]; time: number[]; lapTime: number };

const cache = new Map<string, Lap>();
export function lapFor(driver: string, lapNumber = 0): Lap {
  const key = `${driver}:${lapNumber}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const speed = speedProfile(driver).map((s, i) => s * (1 + 0.004 * Math.sin(i / 55 + lapNumber) + 0.014 * Math.sin(i / 90 + [...driver].reduce((a, c) => a + c.charCodeAt(0), 0))));
  const step = LENGTH_M / (N - 1);
  const time = [0];
  for (let i = 1; i < N; i++) time.push(time[i - 1] + (step / ((speed[i] + speed[i - 1]) / 2 / 3.6)));
  // Scale so the fastest lap is a believable 1:21.xx and lap time depends on pace.
  const base = 81.4 + (PACE[driver] ?? 0.02) * 120 + (lapNumber ? 0.3 * (lapNumber % 5) : 0);
  const k = base / time[N - 1];
  const t = time.map((v) => v * k);
  const lap = { driver, lapNumber: lapNumber || 31, speed, time: t, lapTime: t[N - 1] };
  cache.set(key, lap);
  return lap;
}

function timeAt(lap: Lap, d: number): number {
  const f = Math.min(N - 1, Math.max(0, (d / LENGTH_M) * (N - 1)));
  const i = Math.floor(f);
  return i >= N - 1 ? lap.time[N - 1] : lap.time[i] + (f - i) * (lap.time[i + 1] - lap.time[i]);
}

export function miniSectors(
  year: number, round: number, session: string, scheme: MiniSectorScheme, drivers: string[], lapParam: string,
): MiniSectorsResponse {
  const ms = scheme === "corners" ? cornerBounds() : { boundaries: distanceBounds(), labels: [] as string[] };
  const b = ms.boundaries;
  const lapNo = lapParam === "fastest" ? 0 : Number(lapParam) || 0;
  const per: MiniSectorsResponse["drivers"] = {};
  const seg: Record<string, number[]> = {};
  for (const d of drivers) {
    const lap = lapFor(d, lapNo);
    const t = b.map((x) => timeAt(lap, x));
    seg[d] = t.slice(1).map((v, i) => +(v - t[i]).toFixed(3));
    per[d] = { lap_number: lap.lapNumber, lap_time: +lap.lapTime.toFixed(3), lap_time_source: "telemetry", sector_times: seg[d] };
  }
  const nSec = b.length - 1;
  const best = Array.from({ length: nSec }, (_, i) => Math.min(...drivers.map((d) => seg[d][i])));
  const fastest = best.map((time, i) => ({ sector: i + 1, driver: drivers.find((d) => seg[d][i] === time)!, time }));
  const gaps = Object.fromEntries(drivers.map((d) => [d, seg[d].map((v, i) => +(v - best[i]).toFixed(3))]));
  return {
    meta: { year, round, session, scheme, lap: lapParam, sector_count: nSec, circuit_key: 63, layout_hash: "mock0000layout" },
    boundaries: b, labels: ms.labels ?? [], drivers: per, fastest_per_sector: fastest, gaps,
  };
}

export function delta(year: number, round: number, session: string, ref: string, cmp: string, lapParam: string): DeltaResponse {
  const lapNo = lapParam === "fastest" ? 0 : Number(lapParam) || 0;
  const a = lapFor(ref, lapNo), c = lapFor(cmp, lapNo);
  return {
    meta: { year, round, session, lap: lapParam, circuit_key: 63, layout_hash: "mock0000layout", point_count: N, delta_sign: "positive = cmp slower than ref" },
    ref: { driver: ref, lap_number: a.lapNumber, lap_time: +a.lapTime.toFixed(3), lap_time_source: "telemetry" },
    cmp: { driver: cmp, lap_number: c.lapNumber, lap_time: +c.lapTime.toFixed(3), lap_time_source: "telemetry" },
    distance: G.distance,
    delta: c.time.map((t, i) => +(t - a.time[i]).toFixed(3)),
  };
}

/** Columnar telemetry for one driver and lap, optionally sliced and channel-limited (same contract as A1 phase 1c). */
export function telemetryColumnar(
  driver: string, lapParam: number | undefined, startM: number | undefined, endM: number | undefined, channels: TelemetryChannel[] | undefined,
): ColumnarTelemetry {
  const lap = lapFor(driver, lapParam ?? 0);
  const lo = startM ?? -Infinity, hi = endM ?? Infinity;
  const idx: number[] = [];
  for (let i = 0; i < N; i++) if (G.distance[i] >= lo && G.distance[i] <= hi) idx.push(i);
  const want = (c: TelemetryChannel) => !channels || channels.includes(c);
  const pick = <T,>(f: (i: number) => T) => idx.map(f);
  const inDrs = (d: number) => DRS.some((z) => d >= z.start_m && d <= z.end_m);
  const out: ColumnarTelemetry = {
    driver_code: idx.map(() => driver),
    lap_number: idx.map(() => lap.lapNumber),
    distance_m: pick((i) => G.distance[i]),
  };
  const acc = (i: number) => (lap.speed[Math.min(N - 1, i + 8)] - lap.speed[Math.max(0, i - 8)]) / 8; // smoothed so pedals do not flicker
  if (want("speed")) out.speed_kph = pick((i) => +lap.speed[i].toFixed(1));
  if (want("throttle")) out.throttle_pct = pick((i) => (acc(i) > -0.6 ? (acc(i) > 0.8 ? 100 : Math.round(55 + 40 * Math.min(1, (acc(i) + 0.6) / 1.4))) : 0));
  if (want("brake")) out.brake = pick((i) => acc(i) < -2.4);
  if (want("gear")) out.gear = pick((i) => Math.max(1, Math.min(8, Math.floor(lap.speed[i] / 42) + 1)));
  if (want("rpm")) out.rpm = pick((i) => Math.round(5200 + ((lap.speed[i] % 42) / 42) * 6200));
  if (want("drs")) out.drs = pick((i) => inDrs(G.distance[i]) && lap.speed[i] > 250);
  if (want("time")) out.time_seconds = pick((i) => +lap.time[i].toFixed(3));
  return out;
}
