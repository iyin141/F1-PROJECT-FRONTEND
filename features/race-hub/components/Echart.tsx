"use client";

import { useEffect, useRef } from "react";
import { useChartColours } from "@/components/v2/useChartColours";
import { BarChart, LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsCoreOption } from "echarts/core";

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export { useChartColours };

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
