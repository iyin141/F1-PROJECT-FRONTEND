import type { MiniSectorsResponse, TrackMapResponse } from "@/Lib/api/v2/payloads";

/** Distance-against-time profile of one driver's lap, built from `mini-sectors` (boundaries plus cumulative sector times). */
export type Profile = { driver: string; cum: number[]; lapTime: number; startDelay: number };

export function profilesFrom(ms: MiniSectorsResponse, order: string[]): Profile[] {
  return order.filter((d) => ms.drivers[d]).map((driver, i) => {
    const cum = [0];
    for (const s of ms.drivers[driver].sector_times) cum.push(cum[cum.length - 1] + s);
    // Grid stagger: each car crosses the line 0.9 s after the one in front, so the field starts spread out.
    return { driver, cum, lapTime: cum[cum.length - 1], startDelay: i * 0.9 };
  });
}

/** Distance along the lap in metres (0 to lap length) and the lap number reached, at replay time `t` seconds. */
export function distanceAt(p: Profile, bounds: number[], t: number): { d: number; lap: number } {
  const tt = t - p.startDelay;
  const lap = Math.floor(tt / p.lapTime);
  const u = tt - lap * p.lapTime;
  let i = 0;
  while (i < p.cum.length - 2 && p.cum[i + 1] <= u) i++;
  const span = p.cum[i + 1] - p.cum[i] || 1;
  return { d: bounds[i] + ((u - p.cum[i]) / span) * (bounds[i + 1] - bounds[i]), lap: lap + 1 };
}

/** World scale: 1 unit = 100 m. Map x and y are 1/10 m; y is flipped so the circuit looks like the 2D map from above. */
export const WORLD = 1 / 1000;
export const ELEVATION_EXAGGERATION = 3;

export type Track3D = { pts: Float32Array; n: number; dist: number[]; length: number };

/** Centre the circuit and convert to world [x, elevation, -y] triples. */
export function track3d(g: TrackMapResponse): Track3D {
  const { x, y, z, distance } = g.points;
  const n = x.length;
  const cx = (Math.min(...x) + Math.max(...x)) / 2, cy = (Math.min(...y) + Math.max(...y)) / 2, z0 = Math.min(...z);
  const pts = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pts[3 * i] = (x[i] - cx) * WORLD;
    pts[3 * i + 1] = (z[i] - z0) * WORLD * ELEVATION_EXAGGERATION;
    pts[3 * i + 2] = -(y[i] - cy) * WORLD;
  }
  return { pts, n, dist: distance, length: distance[n - 1] };
}

/** Point on the centre line at distance d (the grid is uniform in distance, so the index is linear). */
export function pointAt(t: Track3D, d: number, out: [number, number, number] = [0, 0, 0]): [number, number, number] {
  const f = (((d % t.length) + t.length) % t.length) / t.length * (t.n - 1);
  const i = Math.min(t.n - 2, Math.floor(f)), k = f - i;
  for (let c = 0; c < 3; c++) out[c] = t.pts[3 * i + c] * (1 - k) + t.pts[3 * (i + 1) + c] * k;
  return out;
}
