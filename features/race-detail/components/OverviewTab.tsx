'use client';

import { Panel } from "@/components/Panel";
import { Skeleton } from "@/components/Skeleton";
import { DriverCode } from "@/components/DriverCode";
import { formatDate } from "@/Lib/format";
import type { ReactNode } from "react";
import { NotAvailable } from "@/features/race-detail/components/NotAvailable";
import type { RaceTabProps } from "@/features/race-detail/components/tab-types";
import type { ChampionshipImpact } from "@/types/ui";
import { useRaceDetail, useRaceWeather, useRaceIncidents } from "@/features/race-detail/hooks/useRaceDetail";
import { adaptRaceDetail, adaptWeather, adaptIncidents } from "@/Lib/adapters";

export const OverviewTab = ({ year, round, upcoming }: RaceTabProps) => {
  const { data: raceData, isLoading: raceLoading } = useRaceDetail(year, round);
  const { data: weatherData, isLoading: weatherLoading } = useRaceWeather(year, round);
  const { data: incidentsData, isLoading: incidentsLoading } = useRaceIncidents(year, round);

  const race = { data: raceData ? adaptRaceDetail(raceData, year) : undefined, loading: raceLoading };
  const weather = { data: weatherData ? adaptWeather(weatherData) : undefined, loading: weatherLoading };
  const incidents = { data: incidentsData ? adaptIncidents(incidentsData) : undefined, loading: incidentsLoading };
  const impact: { data: ChampionshipImpact[] | undefined; loading: boolean } = { data: undefined, loading: false };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Panel label="RACE METADATA">
        {race.loading || !race.data ? <Skeleton className="h-48" /> : (
          <dl className="grid grid-cols-1 gap-y-3 font-mono text-xs sm:grid-cols-2">
            {([
              ["SEASON", race.data.year], ["ROUND", race.data.round],
              ["DATE", formatDate(race.data.date)], ["CIRCUIT", race.data.circuit.name],
              ["COUNTRY", race.data.circuit.country], ["LAPS", race.data.circuit.laps],
              ["DISTANCE", `${(race.data.circuit.lengthKm * race.data.circuit.laps).toFixed(2)} km`],
              ["WEATHER", weather.data ? `${weather.data.conditions} · ${weather.data.airTempC}°C` : "—"],
              ["SC PERIODS", (incidents.data ?? []).filter(i => i.type === "SC" || i.type === "VSC").length],
            ] as Array<[string, ReactNode]>).map(([k, v]) => (
              <div key={k as string} className="contents">
                <dt className="label-mono self-center">{k}</dt>
                <dd className="text-text">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Panel>

      <Panel label="CHAMPIONSHIP IMPACT" title="Top 5 — point swings">
        {upcoming ? <NotAvailable /> : impact.loading ? <Skeleton className="h-48" /> : (
          <div className="space-y-2">
            {impact.data?.map(i => (
              <div key={i.driver.id} className="grid grid-cols-12 items-center gap-2 border-b border-border-subtle/50 py-1.5 font-mono text-xs">
                <span className="col-span-4"><DriverCode driver={i.driver} showName /></span>
                <span className="col-span-2 tabular-nums text-green">+{i.pointsGained}</span>
                <span className="col-span-3 text-[10px] text-text-dim">NEW {i.newTotal}</span>
                <span className="col-span-3 text-right text-[10px] text-text-dim">GAP {i.gapToLeader}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {!upcoming && (
        <Panel label="INCIDENTS" className="lg:col-span-2">
          {incidents.loading ? <Skeleton className="h-20" /> : !incidents.data?.length ? (
            <p className="font-mono text-xs text-text-dim">No incidents recorded.</p>
          ) : (
            <ul className="space-y-2 font-mono text-xs">
              {incidents.data.map((i, idx) => (
                <li key={idx} className="flex flex-wrap gap-3 sm:flex-nowrap sm:gap-4">
                  <span className="w-12 tabular-nums text-muted">L{String(i.lap).padStart(2, "0")}</span>
                  <span className="rounded-sm bg-panel-elev px-2 py-0.5 text-amber">{i.type}</span>
                  <span className="text-text-dim">{i.description}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
};
