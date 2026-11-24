"use client";

import { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { line } from "d3-shape";
import type { TrackMapResponse } from "@/Lib/api/v2/payloads";

export type MiniMapHandle = { setDistance: (d: number | null) => void };

function lowerBound(a: number[], d: number) {
  let lo = 0, hi = a.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] < d) lo = m + 1; else hi = m; }
  return lo;
}

/**
 * Small circuit map for the lab. Clicking a mini-sector (or Enter/Space on it) sets the distance range.
 * The cursor marker is moved by writing attributes directly (no React render per mouse move).
 */
export function MiniMap({
  geometry, range, onPick, handle,
}: {
  geometry: TrackMapResponse;
  range: { start_m?: number; end_m?: number };
  onPick: (startM: number, endM: number) => void;
  handle: React.Ref<MiniMapHandle>;
}) {
  const marker = useRef<SVGCircleElement>(null);
  const { xs, ys, dist } = useMemo(
    () => ({ xs: geometry.points.x.map((v) => v / 10), ys: geometry.points.y.map((v) => -v / 10), dist: geometry.points.distance }),
    [geometry],
  );
  const view = useMemo(() => {
    const pad = 110;
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    return `${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`;
  }, [xs, ys]);
  const b = geometry.mini_sectors.boundaries;
  const gen = useMemo(() => line<number>().x((i) => xs[i]).y((i) => ys[i]), [xs, ys]);
  const seg = (a: number, z: number) => {
    const i0 = lowerBound(dist, a), i1 = Math.min(dist.length - 1, lowerBound(dist, z) + 1);
    return gen(Array.from({ length: i1 - i0 + 1 }, (_, k) => i0 + k)) ?? "";
  };
  const outline = useMemo(() => gen(xs.map((_, i) => i)) ?? "", [gen, xs]);
  const hasRange = range.start_m !== undefined || range.end_m !== undefined;

  useImperativeHandle(handle, () => ({
    setDistance(d) {
      const m = marker.current;
      if (!m) return;
      if (d == null) { m.setAttribute("visibility", "hidden"); return; }
      const i = lowerBound(dist, d);
      m.setAttribute("cx", String(xs[i]));
      m.setAttribute("cy", String(ys[i]));
      m.setAttribute("visibility", "visible");
    },
  }), [dist, xs, ys]);

  useEffect(() => { marker.current?.setAttribute("visibility", "hidden"); }, []);

  return (
    <svg viewBox={view} width="100%" role="group" aria-label="Mini circuit map. Choose a segment to zoom the charts to it." style={{ display: "block", maxHeight: 260 }}>
      <path d={outline} fill="none" stroke="var(--color-border-emphasized)" strokeWidth={40} strokeLinejoin="round" />
      {hasRange ? (
        <path d={seg(range.start_m ?? 0, range.end_m ?? dist[dist.length - 1])} fill="none" stroke="var(--color-text-primary)" strokeWidth={30} />
      ) : null}
      {b.slice(0, -1).map((start, i) => (
        <path
          key={i}
          d={seg(start, b[i + 1])}
          fill="none"
          stroke="transparent"
          strokeWidth={44}
          role="button"
          tabIndex={0}
          aria-label={`${geometry.mini_sectors.labels?.[i] ?? `Sector ${i + 1}`}, ${Math.round(start)} to ${Math.round(b[i + 1])} metres`}
          style={{ cursor: "pointer", outlineOffset: 2 }}
          onClick={() => onPick(Math.round(start), Math.round(b[i + 1]))}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(Math.round(start), Math.round(b[i + 1])); } }}
        />
      ))}
      <circle ref={marker} r={34} fill="var(--color-text-primary)" stroke="var(--color-background-body)" strokeWidth={10} pointerEvents="none" visibility="hidden" />
    </svg>
  );
}
