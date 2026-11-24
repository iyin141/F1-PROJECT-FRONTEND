"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3-selection";
import "d3-transition";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { line } from "d3-shape";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import type { MiniSectorsResponse, TrackMapResponse } from "@/Lib/api/v2/payloads";
import type { Series } from "@/Lib/v2/palette";

export type SectorRange = { index: number; start_m: number; end_m: number };

type Props = {
  geometry: TrackMapResponse;
  /** Per-sector times for the selected drivers; without it the map is drawn neutral. */
  sectors?: MiniSectorsResponse;
  series: Series[];
  /** Click, Enter or Space on a sector. */
  onSelect?: (range: SectorRange) => void;
};

const fmt = (s: number) => s.toFixed(3);
/** First index whose distance is >= d (distances are ascending). */
function lowerBound(a: number[], d: number) {
  let lo = 0, hi = a.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] < d) lo = m + 1; else hi = m; }
  return lo;
}

/**
 * Circuit map: one `<path>` per mini-sector (hit-testing, hover, focus), coloured by the fastest selected driver.
 * Corner numbers, dashed DRS zones, d3-zoom pan/zoom (Ctrl+wheel, drag, pinch). Arrow keys move between sectors.
 */
export function TrackMap({ geometry, sectors, series, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState<number | null>(null); // hovered or focused sector
  const [focused, setFocused] = useState(false);
  const [rover, setRover] = useState(0); // roving tabindex

  const { xs, ys, dist } = useMemo(
    () => ({ xs: geometry.points.x.map((v) => v / 10), ys: geometry.points.y.map((v) => -v / 10), dist: geometry.points.distance }),
    [geometry],
  );
  const bounds = geometry.mini_sectors.boundaries;
  const count = bounds.length - 1;

  const view = useMemo(() => {
    const pad = 120;
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    return { x0: x0 - pad, y0: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
  }, [xs, ys]);

  const paths = useMemo(() => {
    const gen = line<number>().x((i) => xs[i]).y((i) => ys[i]);
    const seg = (a: number, b: number) => {
      const i0 = lowerBound(dist, a), i1 = Math.min(dist.length - 1, lowerBound(dist, b) + 1);
      return gen(Array.from({ length: i1 - i0 + 1 }, (_, k) => i0 + k)) ?? "";
    };
    return {
      sectors: Array.from({ length: count }, (_, i) => seg(bounds[i], bounds[i + 1])),
      drs: geometry.drs_zones.map((z) => seg(z.start_m, z.end_m)),
    };
  }, [xs, ys, dist, bounds, count, geometry.drs_zones]);

  // d3-zoom on the svg; the content group carries the transform.
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = select(svgRef.current);
    const g = select(gRef.current);
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .filter((e: Event) => (e.type === "wheel" ? (e as WheelEvent).ctrlKey || (e as WheelEvent).metaKey : !(e as MouseEvent).button))
      .on("zoom", (e) => g.attr("transform", e.transform.toString()));
    svg.call(z);
    zoomRef.current = z;
    return () => { svg.on(".zoom", null); };
  }, []);

  const resetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const s = select(svgRef.current);
    (reduced ? s : s.transition().duration(250)).call(zoomRef.current.transform as never, zoomIdentity);
  };

  const colourOf = (i: number) => {
    const win = sectors?.fastest_per_sector.find((f) => f.sector === i + 1)?.driver;
    return series.find((s) => s.driver === win)?.colour ?? "var(--color-text-secondary)";
  };
  const labelOf = (i: number) => geometry.mini_sectors.labels?.[i] ?? `Sector ${i + 1}`;
  const choose = (i: number) => onSelect?.({ index: i, start_m: bounds[i], end_m: bounds[i + 1] });

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (step) {
      e.preventDefault();
      const n = (i + step + count) % count;
      setRover(n);
      (svgRef.current?.querySelector(`[data-sector="${n}"]`) as SVGElement | null)?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(i);
    }
  };

  const readout = active === null ? null : (
    <VStack gap={0.5} aria-live="polite">
      <Text weight="semibold">{labelOf(active)} ({Math.round(bounds[active])} to {Math.round(bounds[active + 1])} m)</Text>
      {sectors ? (
        <HStack gap={4} wrap="wrap">
          {Object.entries(sectors.drivers).map(([d, v]) => {
            const gap = sectors.gaps[d]?.[active] ?? 0;
            return (
              <Text key={d} className="f1-num">
                {d} {fmt(v.sector_times[active])} s{gap > 0 ? ` (+${fmt(gap)})` : ""}
              </Text>
            );
          })}
        </HStack>
      ) : <Text color="secondary">Pick drivers to compare this segment.</Text>}
    </VStack>
  );

  return (
    <VStack gap={2}>
      <svg
        ref={svgRef}
        viewBox={`${view.x0} ${view.y0} ${view.w} ${view.h}`}
        width="100%"
        style={{ touchAction: "none", maxHeight: "62vh", display: "block" }}
        role="group"
        aria-label="Circuit map. Arrow keys move between mini-sectors, Enter opens the telemetry lab for the segment."
      >
        <g ref={gRef}>
          <path d={paths.sectors.join(" ")} fill="none" stroke="var(--color-border-emphasized)" strokeWidth={46} strokeLinejoin="round" strokeLinecap="round" />
          {paths.sectors.map((d, i) => (
            <g key={i}>
              {focused && rover === i ? <path d={d} fill="none" stroke="var(--color-text-primary)" strokeWidth={44} strokeLinecap="butt" /> : null}
              <path
                data-sector={i}
                d={d}
                fill="none"
                stroke={colourOf(i)}
                strokeWidth={active === i ? 34 : 28}
                strokeLinecap="butt"
                tabIndex={rover === i ? 0 : -1}
                role="button"
                aria-label={`${labelOf(i)}${sectors ? `, fastest ${sectors.fastest_per_sector.find((f) => f.sector === i + 1)?.driver}` : ""}`}
                style={{ cursor: onSelect ? "pointer" : "default", outline: "none", transition: reduced ? "none" : "stroke-width 120ms" }}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive((a) => (focused ? a : a === i ? null : a))}
                onFocus={() => { setFocused(true); setRover(i); setActive(i); }}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => onKey(e, i)}
                onClick={() => choose(i)}
              />
            </g>
          ))}
          {paths.drs.map((d, i) => (
            <path key={`drs${i}`} d={d} fill="none" stroke="var(--color-background-body)" strokeWidth={8} strokeDasharray="26 20" pointerEvents="none" />
          ))}
          {geometry.corners.map((c) => (
            <text key={c.number} x={c.x / 10} y={-c.y / 10} textAnchor="middle" dominantBaseline="central" fontSize={38} fontWeight={600}
              fill="var(--color-text-primary)" stroke="var(--color-background-body)" strokeWidth={9} paintOrder="stroke" pointerEvents="none"
              className="f1-num">
              {c.number}
            </text>
          ))}
        </g>
      </svg>
      <HStack justify="between" align="center" wrap="wrap" gap={2}>
        <Text color="secondary">Ctrl and scroll to zoom, drag to pan. Dashed: DRS zones.</Text>
        <Button label="Reset zoom" variant="ghost" size="sm" onClick={resetZoom} />
      </HStack>
      <div style={{ minHeight: 56 }}>{readout ?? <Text color="secondary">Hover or focus a segment to see each driver&apos;s time.</Text>}</div>
    </VStack>
  );
}
