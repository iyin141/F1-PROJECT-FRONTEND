"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { BarChart, LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsCoreOption } from "echarts/core";

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

/** Theme-aware chart colours: data-ink first, gridlines at 8% opacity. */
export function useChartColours() {
  const dark = useTheme().resolvedTheme !== "light";
  const ink = dark ? "#ECE6DA" : "#1A1A1C";
  return { ink, muted: dark ? "#B3ACA0" : "#5A554B", grid: dark ? "rgba(236,230,218,0.08)" : "rgba(26,26,28,0.08)", dark };
}

/** Minimal ECharts host: canvas renderer, resizes with its box, animation off for reduced motion. */
export function Echart({ option, height = 360, label }: { option: EChartsCoreOption; height?: number; label: string }) {
  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!el.current) return;
    const c = echarts.init(el.current, undefined, { renderer: "canvas" });
    chart.current = c;
    const ro = new ResizeObserver(() => c.resize());
    ro.observe(el.current);
    return () => { ro.disconnect(); c.dispose(); chart.current = null; };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    chart.current?.setOption({ animation: !reduced, backgroundColor: "transparent", ...option }, true);
  }, [option]);

  return <div ref={el} role="img" aria-label={label} style={{ width: "100%", height }} />;
}
