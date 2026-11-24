"use client";

import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useChartColours } from "@/components/v2/useChartColours";
import { decimate, resample } from "@/Lib/v2/decimate";
import type { TrackCorner } from "@/Lib/api/v2/payloads";

export type DriverSeries = { driver: string; colour: string; dash: number[] | null; x: Float64Array; cols: Record<string, Float64Array> };
export type DeltaSeries = { cmp: string; colour: string; dash: number[] | null; x: Float64Array; y: Float64Array };
export type BenchResult = { cursorMoves: number; cursorAvgMs: number; cursorP95Ms: number; redrawAllMs: number; plots: number; points: number };
export type StackHandle = { bench: () => BenchResult | null };

type Spec = { key: string; label: string; height: number; stepped?: boolean; yRange?: [number, number] };
const SPECS: Spec[] = [
  { key: "speed_kph", label: "Speed km/h", height: 170 },
  { key: "throttle_pct", label: "Throttle %", height: 90, yRange: [0, 100] },
  { key: "brake", label: "Brake", height: 64, stepped: true, yRange: [0, 1] },
  { key: "gear", label: "Gear", height: 90, stepped: true, yRange: [0, 9] },
  { key: "rpm", label: "RPM", height: 90 },
  { key: "drs", label: "DRS", height: 64, stepped: true, yRange: [0, 1] },
];
export const LAB_CHANNELS = ["speed", "throttle", "brake", "gear", "rpm", "drs"] as const;

type Props = {
  drivers: DriverSeries[];
  delta: DeltaSeries[];
  corners: TrackCorner[];
  /** Imperative: called on every cursor move with the distance in metres (or null on leave). Never sets React state. */
  onCursor: (distance: number | null) => void;
  /** Distance range from a drag on any plot. */
  onBrush: (startM: number, endM: number) => void;
  /** Receives the bench handle once plots exist (null on teardown). */
  onReady: (h: StackHandle | null) => void;
};

/**
 * Stacked uPlot charts (delta on top, then speed, throttle, brake, gear, RPM, DRS), x = distance, one synced cursor.
 * Everything here is imperative: React renders one host div; plots are built and driven outside React, so scrubbing
 * never re-renders. Wide ranges are min/max-decimated to two points per pixel.
 */
export function TelemetryStack({ drivers, delta, corners, onCursor, onBrush, onReady }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const colours = useChartColours();
  const cb = useRef({ onCursor, onBrush });
  cb.current = { onCursor, onBrush };

  useEffect(() => {
    const el = host.current;
    if (!el || !drivers.length) return;
    let plots: uPlot[] = [];
    let speedPlot: uPlot | null = null;
    let lastBrush = 0;
    let raf = 0;
    let points = 0;

    const build = () => {
      plots.forEach((p) => p.destroy());
      plots = [];
      el.replaceChildren();
      const width = Math.max(320, Math.floor(el.clientWidth));
      const x = drivers[0].x;
      const xr: [number, number] = [x[0], x[x.length - 1]];
      const maxPts = width * 2;
      const sync = uPlot.sync("lab");
      const rows: { spec: Spec; data: uPlot.AlignedData; series: { colour: string; dash: number[] | null }[] }[] = [];

      if (delta.length) {
        const ds = delta.map((d) => d.x.length === x.length && d.x[0] === x[0] ? d.y : resample(d.x, d.y, x));
        const dec = decimate(x, ds, maxPts);
        rows.push({ spec: { key: "delta", label: "Delta s", height: 110 }, data: [dec.x, ...dec.ys] as uPlot.AlignedData, series: delta });
      }
      for (const spec of SPECS) {
        const ys = drivers.map((d) => (d.x.length === x.length && d.x[0] === x[0] ? d.cols[spec.key] : resample(d.x, d.cols[spec.key], x)));
        const dec = decimate(x, ys, maxPts);
        points = dec.x.length;
        rows.push({ spec, data: [dec.x, ...dec.ys] as uPlot.AlignedData, series: drivers });
      }

      rows.forEach((row, idx) => {
        const last = idx === rows.length - 1;
        const first = idx === 0;
        const div = document.createElement("div");
        el.append(div);
        const drawCorners = (u: uPlot) => {
          if (!corners.length) return;
          const { ctx } = u;
          const { left, top, width: w, height: h } = u.bbox;
          const dpr = devicePixelRatio || 1;
          ctx.save();
          ctx.strokeStyle = colours.grid;
          ctx.fillStyle = colours.muted;
          ctx.font = `${11 * dpr}px sans-serif`;
          ctx.lineWidth = dpr;
          for (const c of corners) {
            if (c.distance == null) continue;
            const px = Math.round(u.valToPos(c.distance, "x", true));
            if (px < left || px > left + w) continue;
            ctx.beginPath();
            ctx.moveTo(px, top);
            ctx.lineTo(px, top + h);
            ctx.stroke();
            if (first) ctx.fillText(`T${c.number}`, px + 3 * dpr, top + 11 * dpr);
            else if (last) ctx.fillText(`T${c.number}`, px + 3 * dpr, top + h - 4 * dpr);
          }
          ctx.restore();
        };
        const opts: uPlot.Options = {
          width,
          height: row.spec.height,
          legend: { show: false },
          padding: [6, 10, 0, 0],
          scales: {
            x: { time: false, range: () => xr },
            y: row.spec.yRange ? { range: () => row.spec.yRange! } : {},
          },
          axes: [
            { show: last, stroke: colours.muted, size: 26, grid: { stroke: colours.grid, width: 1 }, ticks: { stroke: colours.grid }, values: (_u, v) => v.map((n) => `${Math.round(n)} m`) },
            { stroke: colours.muted, size: 58, label: row.spec.label, labelSize: 14, labelFont: "11px sans-serif", font: "11px sans-serif", grid: { stroke: colours.grid, width: 1 }, ticks: { show: false } },
          ],
          series: [
            {},
            ...row.series.map((s) => ({
              stroke: s.colour,
              width: 1.6,
              dash: s.dash ?? undefined,
              points: { show: false },
              paths: row.spec.stepped ? uPlot.paths.stepped!({ align: 1 }) : undefined,
            })),
          ],
          cursor: { sync: { key: sync.key, setSeries: false }, drag: { x: true, y: false, setScale: false }, points: { show: false }, lock: false },
          select: { show: true, left: 0, top: 0, width: 0, height: 0 },
          hooks: {
            draw: [drawCorners],
            setSelect: [
              (u) => {
                const now = performance.now();
                if (u.select.width < 6 || now - lastBrush < 80) return;
                lastBrush = now;
                const a = u.posToVal(u.select.left, "x");
                const b = u.posToVal(u.select.left + u.select.width, "x");
                u.setSelect({ left: 0, top: 0, width: 0, height: 0 }, false);
                cb.current.onBrush(Math.round(a), Math.round(b));
              },
            ],
            ...(row.spec.key === "speed_kph"
              ? { setCursor: [(u: uPlot) => { const i = u.cursor.idx; cb.current.onCursor(i == null ? null : (u.data[0][i] as number)); }] }
              : {}),
          },
        };
        const u = new uPlot(opts, row.data, div);
        if (row.spec.key === "speed_kph") speedPlot = u;
        plots.push(u);
      });
    };

    build();
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(build);
    });
    ro.observe(el);
    const leave = () => cb.current.onCursor(null);
    el.addEventListener("mouseleave", leave);

    onReady({
      bench: () => {
        const u = speedPlot;
        if (!u) return null;
        const w = u.bbox.width / (devicePixelRatio || 1);
        const times: number[] = [];
        for (let i = 0; i < 300; i++) {
          const t0 = performance.now();
          u.setCursor({ left: (i / 299) * w, top: 20 });
          times.push(performance.now() - t0);
        }
        u.setCursor({ left: -10, top: -10 });
        const t1 = performance.now();
        plots.forEach((p) => p.redraw(true, true));
        const redrawAllMs = performance.now() - t1;
        times.sort((a, b) => a - b);
        return {
          cursorMoves: times.length,
          cursorAvgMs: times.reduce((a, b) => a + b, 0) / times.length,
          cursorP95Ms: times[Math.floor(times.length * 0.95)],
          redrawAllMs,
          plots: plots.length,
          points,
        };
      },
    });

    return () => {
      el.removeEventListener("mouseleave", leave);
      ro.disconnect();
      cancelAnimationFrame(raf);
      plots.forEach((p) => p.destroy());
      onReady(null);
    };
  }, [drivers, delta, corners, colours.grid, colours.muted, onReady]);

  return <div ref={host} style={{ width: "100%" }} />;
}
