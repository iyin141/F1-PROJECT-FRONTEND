'use client';

import React, { useMemo, useRef, useEffect } from "react";
import Skeleton from "@/components/animations/Skeleton";
import * as d3 from "d3";
import { driverById } from "@/Lib/data/drivers";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { useLapTimes, useRacePositions } from "@/features/race-analysis/hooks/useRaceAnalysis";
import { secondsToHMS } from "@/Lib/utils/timeConvert";
import { tyreToken } from "@/Lib/utils/chartTokens";
import type { LapTime } from "@/types/ui";
import type { UnifiedPositionRow } from "@/types/endpoints";

const CHART_H = 340;

interface ScBand {
  lapFrom: number;
  lapTo: number;
  type: "SC" | "VSC";
}

function deriveSCBands(rows: UnifiedPositionRow[]): ScBand[] {
  const lapStatus = new Map<number, string>();
  for (const r of rows) {
    const status = (r.track_status ?? "").toUpperCase();
    if (status && !lapStatus.has(r.lap_number)) {
      lapStatus.set(r.lap_number, status);
    }
  }
  const bands: ScBand[] = [];
  let current: ScBand | null = null;
  const sortedLaps = [...lapStatus.entries()].sort((a, b) => a[0] - b[0]);
  for (const [lap, status] of sortedLaps) {
    const type = status.includes("VIRTUAL") || status === "VSC" ? "VSC" : status.includes("SAFETY") || status === "SC" ? "SC" : null;
    if (type) {
      if (current && current.type === type && current.lapTo === lap - 1) {
        current.lapTo = lap;
      } else {
        if (current) bands.push(current);
        current = { lapFrom: lap, lapTo: lap, type };
      }
    } else {
      if (current) bands.push(current);
      current = null;
    }
  }
  if (current) bands.push(current);
  return bands;
}

export const PaceComparison = ({
  year,
  round,
  session = "R",
  mode = "compare",
  driverAId,
  driverBId,
  driverCId,
}: {
  year: number;
  round: number;
  session?: string;
  mode?: "compare" | "all";
  driverAId?: string;
  driverBId?: string;
  driverCId?: string;
}) => {
  const { data: laps, isLoading } = useLapTimes(year, round, session);
  const { data: positionsData } = useRacePositions(year, round, true, session);
  const { ref, size } = useResizeObserver<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scBands = useMemo(() => {
    if (!positionsData?.data) return [];
    return deriveSCBands(positionsData.data);
  }, [positionsData]);

  const chart = useMemo(() => {
    const data = laps;
    if (!data || size.width < 60) return null;

    if (mode === "all") {
      const points = data
        .filter((l: LapTime) => !l.pit)
        .map((l: LapTime) => ({
          lap: l.lap,
          timeSec: l.timeMs / 1000,
          compound: (l.compound ?? "soft").toLowerCase(),
          driverId: l.driverId,
        }));

      if (!points.length) return null;

      const allTimes = points.map((p) => p.timeSec).sort((a, b) => a - b);
      const maxT = allTimes[allTimes.length - 1] ?? 95;
      const minT = (allTimes[0] ?? 80) - 0.5;
      const minLap = Math.min(...points.map((p) => p.lap));
      const maxLap = Math.max(...points.map((p) => p.lap));

      return { kind: "all" as const, points, maxT, minT, minLap, maxLap };
    }

    const selectedIds = [driverAId, driverBId, driverCId].filter(Boolean) as string[];
    if (selectedIds.length < 1) return null; // allow single driver for testing, but typically 2

    const TRACE_COLORS = ["#0088FF", "#E8002D", "#F5A623"];
    const traces = selectedIds.map((id, index) => {
      const driver = driverById(id);
      const tColor = TRACE_COLORS[index] ?? "#666";
      
      const driverLaps = data
        .filter((l: LapTime) => l.driverId.toUpperCase() === (driver?.code ?? id).toUpperCase())
        .sort((a, b) => a.lap - b.lap);

      const validTimes = driverLaps.map(l => l.timeMs).filter(t => t > 50000).sort((a, b) => a - b);
      const median = validTimes.length > 0 ? validTimes[Math.floor(validTimes.length / 2)] : 0;
      const cutoff = median > 0 ? median * 1.07 : Infinity;

      // Separate clean laps (line) from outliers (dots)
      const isOutlier = (l: LapTime) => l.lap === 1 || l.pit || l.timeMs > cutoff || scBands.some(b => l.lap >= b.lapFrom && l.lap <= b.lapTo);

      return {
        id,
        color: tColor,
        code: driver?.code ?? id.toUpperCase(),
        laps: driverLaps.map((l: LapTime) => {
          const out = isOutlier(l);
          return { 
            lap: l.lap, 
            timeSec: out ? null : l.timeMs / 1000,
            outlierTimeSec: out ? l.timeMs / 1000 : null,
            isOutlier: out,
            pit: !!l.pit
          };
        }),
        pitLaps: driverLaps.filter(l => l.pit).map(l => l.lap)
      };
    });

    const allTimes = traces.flatMap((t) => t.laps.filter(l => !l.isOutlier).map((l) => l.timeSec as number)).sort((a, b) => a - b);
    if (!allTimes.length) return null;

    const maxT = allTimes[allTimes.length - 1] ?? 95;
    const minT = (allTimes[0] ?? 80) - 0.5;
    const allLapNums = traces.flatMap((t) => t.laps.map((l) => l.lap));
    const minLap = Math.min(...allLapNums);
    const maxLap = Math.max(...allLapNums);

    return { kind: "compare" as const, traces, maxT, minT, minLap, maxLap };
  }, [laps, size.width, mode, driverAId, driverBId, driverCId, scBands]);

  useEffect(() => {
    if (!svgRef.current || !chart || size.width < 60) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = size.width;
    const height = CHART_H;
    const margin = { top: 14, right: 32, bottom: 20, left: 48 };
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain([chart.minLap, chart.maxLap])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([chart.minT ?? 80, (chart.maxT ?? 95) + 1])
      .range([innerHeight, 0]);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const chartArea = svg.append("svg")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("viewBox", `0 0 ${innerWidth} ${innerHeight}`)
      .style("overflow", "hidden");

    const xAxis = d3.axisBottom(x).ticks(Math.ceil((chart.maxLap - chart.minLap) / 5)).tickFormat(d => d.toString()).tickSize(-innerHeight);
    const yAxis = d3.axisLeft(y).tickFormat((d: any) => secondsToHMS(Number(d), true)).tickSize(-innerWidth);

    const gx = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    const gy = g.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    const styleAxes = () => {
      svg.selectAll(".domain").remove();
      svg.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.04)");
      svg.selectAll(".tick text").attr("fill", "rgba(255,255,255,0.35)").attr("font-size", 10).attr("font-family", "var(--font-mono)");
    };
    styleAxes();

    g.append("text")
      .attr("x", -40)
      .attr("y", innerHeight + 15)
      .attr("fill", "rgba(255,255,255,0.35)")
      .attr("font-size", 9)
      .attr("font-family", "var(--font-mono)")
      .text("FASTER ↓");

    // Draw SC Bands
    scBands.forEach((band, i) => {
      chartArea.append("rect")
        .datum(band)
        .attr("class", `sc-band sc-band-${i}`)
        .attr("x", x(band.lapFrom))
        .attr("y", 0)
        .attr("width", Math.max(1, x(band.lapTo) - x(band.lapFrom)))
        .attr("height", innerHeight)
        .attr("fill", "rgba(255,214,0,0.06)");
        
      chartArea.append("line")
        .datum(band)
        .attr("class", `sc-band-border sc-band-border-${i}`)
        .attr("x1", x(band.lapFrom))
        .attr("x2", x(band.lapFrom))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "rgba(255,214,0,0.4)")
        .attr("stroke-width", 1);
        
      chartArea.append("text")
        .datum(band)
        .attr("class", `sc-band-label sc-band-label-${i}`)
        .attr("x", x(band.lapFrom) + 4)
        .attr("y", 12)
        .attr("fill", "rgba(255,214,0,0.4)")
        .attr("font-size", 9)
        .attr("font-family", "var(--font-mono)")
        .text(band.type);
    });

    if (chart.kind === "compare") {
      chart.traces.forEach(tr => {
        const line = d3.line<any>()
          .defined(d => !d.isOutlier && d.timeSec !== null)
          .x(d => x(d.lap))
          .y(d => y(d.timeSec));

        chartArea.append("path")
          .datum(tr.laps)
          .attr("class", `trace-line-${tr.id}`)
          .attr("fill", "none")
          .attr("stroke", tr.color)
          .attr("stroke-width", 2)
          .attr("d", line);

        chartArea.selectAll(`.dot-${tr.id}`)
          .data(tr.laps.filter((l: any) => !l.isOutlier && l.timeSec !== null))
          .enter()
          .append("circle")
          .attr("class", `trace-dot-${tr.id}`)
          .attr("cx", (d: any) => x(d.lap))
          .attr("cy", (d: any) => y(d.timeSec))
          .attr("r", 2)
          .attr("fill", tr.color)
          .attr("fill-opacity", 0.8);

        chartArea.selectAll(`.outlier-${tr.id}`)
          .data(tr.laps.filter((l: any) => l.isOutlier && l.outlierTimeSec !== null))
          .enter()
          .append("circle")
          .attr("class", `trace-outlier-${tr.id}`)
          .attr("cx", (d: any) => x(d.lap))
          .attr("cy", (d: any) => y(d.outlierTimeSec))
          .attr("r", 3)
          .attr("stroke", tr.color)
          .attr("stroke-width", 1.5)
          .attr("fill", "transparent")
          .attr("opacity", 0.4);

        chartArea.selectAll(`.pit-${tr.id}`)
          .data(tr.pitLaps)
          .enter()
          .append("rect")
          .attr("class", `trace-pit-${tr.id}`)
          .attr("x", (d: any) => x(d) - 0.5)
          .attr("y", innerHeight - 8)
          .attr("width", 1)
          .attr("height", 8)
          .attr("fill", tr.color);
      });
    } else if (chart.kind === "all") {
      chartArea.selectAll(".all-dot")
        .data(chart.points.filter(p => p.timeSec !== null))
        .enter()
        .append("circle")
        .attr("class", "all-dot")
        .attr("cx", (d: any) => x(d.lap))
        .attr("cy", (d: any) => y(d.timeSec))
        .attr("r", 2.5)
        .attr("fill", (d: any) => `hsl(${tyreToken(d.compound) || '0 0% 50%'})`)
        .attr("fill-opacity", 0.72);
    }

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [innerWidth, innerHeight]])
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(x);
        const newY = event.transform.rescaleY(y);

        gx.call(xAxis.scale(newX));
        gy.call(yAxis.scale(newY));
        styleAxes();

        if (chart.kind === "compare") {
          chart.traces.forEach(tr => {
            const line = d3.line<any>()
              .defined(d => !d.isOutlier && d.timeSec !== null)
              .x(d => newX(d.lap))
              .y(d => newY(d.timeSec));

            chartArea.select(`.trace-line-${tr.id}`).attr("d", line as any);
            chartArea.selectAll(`.trace-dot-${tr.id}`)
              .attr("cx", (d: any) => newX(d.lap))
              .attr("cy", (d: any) => newY(d.timeSec));
            chartArea.selectAll(`.trace-outlier-${tr.id}`)
              .attr("cx", (d: any) => newX(d.lap))
              .attr("cy", (d: any) => newY(d.outlierTimeSec));
            chartArea.selectAll(`.trace-pit-${tr.id}`)
              .attr("x", (d: any) => newX(d) - 0.5);
          });
        } else {
          chartArea.selectAll(".all-dot")
            .attr("cx", (d: any) => newX(d.lap))
            .attr("cy", (d: any) => newY(d.timeSec));
        }

        scBands.forEach((band, i) => {
          chartArea.selectAll(`.sc-band-${i}`)
            .attr("x", newX(band.lapFrom))
            .attr("width", Math.max(1, newX(band.lapTo) - newX(band.lapFrom)));
          chartArea.selectAll(`.sc-band-border-${i}`)
            .attr("x1", newX(band.lapFrom))
            .attr("x2", newX(band.lapFrom));
          chartArea.selectAll(`.sc-band-label-${i}`)
            .attr("x", newX(band.lapFrom) + 4);
        });
      });

    svg.call(zoom);

    const tooltip = d3.select(containerRef.current).select(".d3-tooltip");
    
    const overlay = chartArea.append("rect")
      .attr("class", "overlay")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("pointer-events", "all");

    overlay.on("mousemove", (event) => {
      const [mx, my] = d3.pointer(event);
      const transform = d3.zoomTransform(svg.node()!);
      const currentX = transform.rescaleX(x);

      const hoveredLap = Math.round(currentX.invert(mx));
      if (hoveredLap < chart.minLap || hoveredLap > chart.maxLap) {
        tooltip.style("display", "none");
        return;
      }
      
      let html = `<div class="font-bold mb-1 border-b border-white/10 pb-1">Lap ${hoveredLap}</div>`;
      let hasData = false;
      
      if (chart.kind === "compare") {
        chart.traces.forEach(tr => {
          const l = tr.laps.find((lap: any) => lap.lap === hoveredLap);
          if (l && (l.timeSec !== null || l.outlierTimeSec !== null)) {
            hasData = true;
            const time = l.timeSec ?? l.outlierTimeSec;
            const outStr = l.isOutlier ? " <span class='text-white/40 text-[9px]'>(OUTLIER)</span>" : "";
            html += `<div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full" style="background:${tr.color}"></span><span class="text-white/70">${tr.code}:</span> <span>${secondsToHMS(time, true)}${outStr}</span></div>`;
          }
        });
      } else {
        const points = chart.points.filter(p => p.lap === hoveredLap);
        points.forEach(p => {
          hasData = true;
          const color = `hsl(${tyreToken(p.compound) || '0 0% 50%'})`;
          html += `<div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full" style="background:${color}"></span><span class="text-white/70">${p.driverId}:</span> <span>${secondsToHMS(p.timeSec, true)} <span class="text-white/40 text-[9px]">(${p.compound.toUpperCase()})</span></span></div>`;
        });
      }

      if (hasData) {
        tooltip.style("display", "block")
          .html(html)
          .style("left", `${mx + margin.left + 15}px`)
          .style("top", `${my + margin.top + 15}px`);
      } else {
        tooltip.style("display", "none");
      }
    });

    overlay.on("mouseout", () => {
      tooltip.style("display", "none");
    });

  }, [chart, size.width, scBands]);

  if (isLoading) return <Skeleton height={CHART_H} />;

  return (
    <div ref={ref} className="w-full bg-[#0A0A0F] border border-border-subtle pb-4">
      <div className="flex h-[40px] items-center px-4 border-b border-border-subtle">
        <span className="font-mono text-[11px] uppercase tracking-wide text-white/40">
          Lap Time Trace
        </span>
      </div>

      {chart && size.width > 60 ? (
        <>
          <div ref={containerRef} className="mt-4 relative" style={{ height: CHART_H }}>
            <svg ref={svgRef} className="w-full h-full cursor-crosshair" />
            <div 
              className="d3-tooltip absolute pointer-events-none bg-[#0A0A0F] border border-white/10 rounded px-3 py-2 font-mono text-[11px] text-white z-10 shadow-xl backdrop-blur-md"
              style={{ display: "none" }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 px-6 font-mono text-[10px] text-white/40">
            {chart.kind === 'compare' &&
              chart.traces.map((tr) => (
                <span key={tr.id} className="flex items-center gap-2">
                  <span className="h-0.5 w-4" style={{ background: tr.color }} />
                  <span className="text-white/70">{tr.code}</span>
                </span>
              ))}

            {chart.kind === 'compare' && (
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full border border-white/40 bg-transparent" />
                <span>OUTLIER / PIT LAP</span>
              </span>
            )}

            {chart.kind === 'all' &&
              ([['soft', 'SOFT'], ['medium', 'MEDIUM'], ['hard', 'HARD'], ['inter', 'INTER'], ['wet', 'WET']] as const).map(([key, label]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: tyreToken(key) }} />
                  <span className="text-white/70">{label}</span>
                </span>
              ))}

            <span className="ml-auto text-[9px] text-white/30">
              Y-AXIS REVERSED · MAX TIME: {(chart.maxT ?? 0).toFixed(1)}s
            </span>
          </div>
        </>
      ) : (
        <div className="flex h-[340px] items-center justify-center font-mono text-[10px] uppercase tracking-widest text-white/35">
          {mode === "all" ? "NO LAP DATA AVAILABLE" : "SELECT DRIVERS TO COMPARE"}
        </div>
      )}
    </div>
  );
};
