'use client';

import Link from "next/link";
import { ArrowRight, Cloud, CloudRain, Sun } from "lucide-react";
import { DriverCode } from "@/components/DriverCode";
import { EmptyState } from "@/components/EmptyState";
import { Panel } from "@/components/Panel";
import { Skeleton } from "@/components/Skeleton";
import { GenericTable, type ColumnDef } from "@/components/ui/GenericTable";
import type { Incident, Race, RaceResult, WeatherSnapshot } from "@/types/ui";

const columns: ColumnDef<RaceResult>[] = [
  {
    key: "pos",
    width: "1fr",
    header: "POS",
    render: r => <span className="tabular-nums">{r.position}</span>,
  },
  {
    key: "driver",
    width: "5fr",
    header: "DRIVER",
    render: r => <div className="min-w-0"><DriverCode driver={r.driver} showName /></div>,
  },
  {
    key: "gap",
    width: "3fr",
    header: "TIME / GAP",
    render: r => <span className="truncate text-text-dim tabular-nums">{r.gap}</span>,
  },
  {
    key: "pts",
    width: "2fr",
    header: "PTS",
    align: "right",
    render: r => <span className="tabular-nums">{r.points}</span>,
  },
  {
    key: "fast",
    width: "1fr",
    header: "FL",
    align: "right",
    render: r => <span>{r.fastestLap ? <span className="text-amber">●</span> : ""}</span>,
  },
];

const WeatherIcon = ({ condition }: { condition: WeatherSnapshot["conditions"] }) =>
  condition === "Wet" ? <CloudRain size={14} /> : condition === "Cloudy" ? <Cloud size={14} /> : <Sun size={14} />;

type LastRacePanelProps = {
  race: Race | undefined;
  results: RaceResult[] | undefined;
  incidents: Incident[] | undefined;
  weather: WeatherSnapshot | null | undefined;
  loading: boolean;
};

export const LastRacePanel = ({ race, results, incidents, weather, loading }: LastRacePanelProps) => {
  const scCount = (incidents ?? []).filter(i => i.type === "SC" || i.type === "VSC").length;

  return (
    <Panel
      label="LAST RACE"
      title={race?.name}
      action={
        race && (
          <Link
            href={`/race/${race.year}/${race.round}/analysis`}
            className="inline-flex items-center gap-2 border border-red bg-red/10 px-3 py-1.5 font-mono text-[11px] tracking-wider text-red transition-colors hover:bg-red hover:text-white"
          >
            OPEN RACE ANALYSIS <ArrowRight size={12} />
          </Link>
        )
      }
    >
      {loading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-7" />)}</div>
      ) : !results?.length ? (
        <EmptyState message="NO RESULTS" />
      ) : (
        <>
          <div className="panel-scroll w-full">
            <GenericTable<RaceResult>
              className="data-grid w-full min-w-[36rem] font-mono text-xs md:min-w-[42rem]"
              columns={columns}
              data={results.slice(0, 10)}
              getRowKey={r => r.driver.id}
              striped
              getRowVariant={r => {
                if (r.position === 1) return "pole";
                if (r.fastestLap) return "fastlap";
                return "default";
              }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border-subtle pt-4 sm:grid-cols-4">
            <div><div className="label-mono">POLE</div><div className="mt-1 font-mono text-sm">{results[0]?.driver.code}</div></div>
            <div><div className="label-mono">FASTEST LAP</div><div className="mt-1 font-mono text-sm">{results.find(r => r.fastestLap)?.driver.code ?? "—"}</div></div>
            <div><div className="label-mono">SC PERIODS</div><div className="mt-1 font-mono text-sm tabular-nums">{scCount}</div></div>
            <div>
              <div className="label-mono">WEATHER</div>
              <div className="mt-1 flex items-center gap-1 font-mono text-sm">
                {weather && <><WeatherIcon condition={weather.conditions} /> {weather.airTempC}°C</>}
              </div>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
};
