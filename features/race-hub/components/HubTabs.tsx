"use client";

import { useMemo, useState } from "react";
import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { Tab } from "@astryxdesign/core/TabList";
import { TabList } from "@astryxdesign/core/TabList";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { Stat } from "@/components/v2/Stat";
import { useRaceIncidents, useRaceResults, useRaceWeather } from "@/features/race-detail/hooks/useRaceDetail";
import { useRacePositions, useTyreStrategy } from "@/features/race-analysis/hooks/useRaceAnalysis";
import { COMPOUND_COLOURS, seriesFor } from "@/Lib/v2/palette";
import { Echart, useChartColours } from "./Echart";

const TABS = [["results", "Results"], ["strategy", "Strategy"], ["positions", "Positions"], ["weather", "Weather"], ["incidents", "Incidents"]] as const;
type TabId = (typeof TABS)[number][0];

const Empty = ({ what }: { what: string }) => <Text color="secondary">{what} is not available for this race yet.</Text>;
const Loading = () => <Text color="secondary">Loading</Text>;

function Results({ year, round }: { year: number; round: number }) {
  const { data, isLoading } = useRaceResults(year, round);
  if (isLoading) return <Loading />;
  if (!data?.length) return <Empty what="Race result" />;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="f1-table">
        <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Grid</th><th>Laps</th><th>Time / gap</th><th>Pts</th></tr></thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.driver.code + r.position}>
              <td>{r.position}</td><td>{r.driver.code}</td><td>{r.driver.team}</td><td>{r.startGrid}</td><td>{r.laps}</td>
              <td>{r.gap ?? r.time ?? r.status}</td><td>{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Strategy({ year, round }: { year: number; round: number }) {
  const { data, isLoading } = useTyreStrategy(year, round);
  const c = useChartColours();
  const option = useMemo(() => {
    if (!data?.length) return null;
    const drivers = [...new Set(data.map((s) => s.driverId))];
    const maxStint = Math.max(...data.map((s) => s.stintNumber));
    const colour = (k: string) => COMPOUND_COLOURS[k.toUpperCase() as keyof typeof COMPOUND_COLOURS] ?? c.muted;
    return {
      grid: { left: 48, right: 16, top: 8, bottom: 28 },
      tooltip: { trigger: "item", formatter: (p: { seriesName: string; name: string; data: { compound: string; value: number } }) => `${p.name}: ${p.data.compound}, ${p.data.value} laps` },
      xAxis: { type: "value", axisLabel: { color: c.muted }, splitLine: { lineStyle: { color: c.grid } } },
      yAxis: { type: "category", inverse: true, data: drivers, axisLabel: { color: c.ink }, axisLine: { show: false }, axisTick: { show: false } },
      series: Array.from({ length: maxStint }, (_, k) => ({
        type: "bar", stack: "s", name: `Stint ${k + 1}`, barWidth: 12,
        data: drivers.map((d) => {
          const s = data.find((x) => x.driverId === d && x.stintNumber === k + 1);
          return s ? { value: s.endLap - s.startLap + 1, compound: s.compound, itemStyle: { color: colour(s.compound), borderColor: "#15161A", borderWidth: 1 } } : { value: 0 };
        }),
      })),
    };
  }, [data, c]);
  if (isLoading) return <Loading />;
  if (!option) return <Empty what="Tyre strategy" />;
  return <Echart option={option} height={Math.max(320, (data?.length ?? 0) * 6)} label="Tyre stints per driver, coloured by compound" />;
}

function Positions({ year, round }: { year: number; round: number }) {
  const { data, isLoading } = useRacePositions(year, round);
  const c = useChartColours();
  const option = useMemo(() => {
    const rows = data?.data;
    if (!rows?.length) return null;
    const codes = [...new Set(rows.map((r) => r.driver_code))];
    const series = seriesFor(codes.map((code) => ({ code })));
    return {
      grid: { left: 36, right: 16, top: 8, bottom: 28 },
      tooltip: { trigger: "axis" },
      xAxis: { type: "value", min: 1, name: "Lap", nameLocation: "middle", nameGap: 22, axisLabel: { color: c.muted }, splitLine: { lineStyle: { color: c.grid } } },
      yAxis: { type: "value", inverse: true, min: 1, max: codes.length, interval: 1, axisLabel: { color: c.muted }, splitLine: { lineStyle: { color: c.grid } } },
      series: series.map((s) => ({
        type: "line", name: s.driver, showSymbol: false, lineStyle: { color: s.colour, width: 2, type: s.dash ? "dashed" : "solid" }, itemStyle: { color: s.colour },
        data: rows.filter((r) => r.driver_code === s.driver).map((r) => [r.lap_number, r.position]),
      })),
    };
  }, [data, c]);
  if (isLoading) return <Loading />;
  if (!option) return <Empty what="Position data" />;
  return <Echart option={option} height={420} label="Race position by lap for every driver" />;
}

function Weather({ year, round }: { year: number; round: number }) {
  const { data, isLoading } = useRaceWeather(year, round);
  if (isLoading) return <Loading />;
  if (!data) return <Empty what="Weather" />;
  return (
    <HStack gap={6} wrap="wrap">
      <Stat value={data.airTempC.toFixed(1)} unit="°C" caption="Air" />
      <Stat value={data.trackTempC.toFixed(1)} unit="°C" caption="Track" />
      <Stat value={Math.round(data.humidity)} unit="%" caption="Humidity" />
      <Stat value={Math.round(data.windKph)} unit="km/h" caption="Wind" />
      <Stat value={data.conditions} caption="Conditions" />
    </HStack>
  );
}

function Incidents({ year, round }: { year: number; round: number }) {
  const { data, isLoading } = useRaceIncidents(year, round);
  if (isLoading) return <Loading />;
  if (!data?.length) return <Empty what="Incident log" />;
  return (
    <VStack gap={2} as="ol" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {[...data].sort((a, b) => a.lap - b.lap).map((i, n) => (
        <li key={n} style={{ display: "flex", gap: 12 }}>
          <Text className="f1-num" weight="semibold" style={{ minWidth: 56 }}>Lap {i.lap}</Text>
          <Text weight="semibold" style={{ minWidth: 72 }}>{i.type}</Text>
          <Text color="secondary">{i.description}</Text>
        </li>
      ))}
    </VStack>
  );
}

/** Results, Strategy, Positions, Weather and Incidents. Only the active tab mounts, so only its data is requested. */
export function HubTabs({ year, round }: { year: number; round: number }) {
  const [tab, setTab] = useState<TabId>("results");
  return (
    <Card padding={4}>
      <VStack gap={4}>
        <TabList value={tab} onChange={(v) => setTab(v as TabId)}>
          {TABS.map(([id, label]) => <Tab key={id} value={id} label={label} panelId={`hub-panel-${id}`} />)}
        </TabList>
        <div id={`hub-panel-${tab}`} role="tabpanel" style={{ minHeight: 200 }}>
          {tab === "results" && <Results year={year} round={round} />}
          {tab === "strategy" && <Strategy year={year} round={round} />}
          {tab === "positions" && <Positions year={year} round={round} />}
          {tab === "weather" && <Weather year={year} round={round} />}
          {tab === "incidents" && <Incidents year={year} round={round} />}
        </div>
      </VStack>
    </Card>
  );
}
