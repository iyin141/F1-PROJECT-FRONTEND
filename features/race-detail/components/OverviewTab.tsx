'use client';

import { useMemo } from "react";
import { Panel } from "@/components/Panel";
import { EmptyState } from "@/components/EmptyState";
import { DriverCode } from "@/components/DriverCode";
import { formatDate } from "@/Lib/format";
import type { ReactNode } from "react";
import { NotAvailable } from "@/features/race-detail/components/NotAvailable";
import type { RaceTabProps } from "@/features/race-detail/components/tab-types";
import type { ChampionshipImpact } from "@/types/ui";
import { useRaceDetail, useRaceWeather, useRaceIncidents, useRaceResults } from "@/features/race-detail/hooks/useRaceDetail";
import { useDriverStandings } from "@/features/season-hub/hooks/useSeasonHub";
import { TableSkeleton } from "@/components/animations/TableSkeleton";

export const OverviewTab = ({ year, round, upcoming }: RaceTabProps) => {
  const { data: raceData, isLoading: raceLoading } = useRaceDetail(year, round);
  const { data: weatherData, isLoading: weatherLoading } = useRaceWeather(year, round);
  const { data: incidentsData, isLoading: incidentsLoading } = useRaceIncidents(year, round);
  const { data: resultsData, isLoading: resultsLoading } = useRaceResults(year, round, !upcoming);
  const { data: standingsData, isLoading: standingsLoading } = useDriverStandings(year);

  const impact: { data: ChampionshipImpact[] | undefined; loading: boolean } = useMemo(() => {
    if (!resultsData || !standingsData) {
      return { data: undefined, loading: resultsLoading || standingsLoading };
    }
    
    const results = resultsData;
    const standings = standingsData;
    const leader = standings[0];
    
    if (!leader) return { data: [], loading: false };
    
    const impact: ChampionshipImpact[] = results
      .filter((_, idx) => idx < 5)
      .map(result => {
        const standing = standings.find(s => s.driver.code === result.driver.code);
        return {
          driver: result.driver,
          pointsGained: result.points,
          newTotal: standing?.points ?? 0,
          gapToLeader: Math.max(0, leader.points - (standing?.points ?? 0)),
        };
      });
    
    return { data: impact, loading: false };
  }, [resultsData, standingsData, resultsLoading, standingsLoading]);

  const isTabLoading = raceLoading || weatherLoading || incidentsLoading || resultsLoading || standingsLoading;

  if (isTabLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel label="RACE METADATA">
          <TableSkeleton rows={8} customTexts={["Fetching race metadata...", "Loading weather reports..."]} />
        </Panel>
        <Panel label="CHAMPIONSHIP IMPACT">
          <TableSkeleton rows={5} customTexts={["Calculating point swings...", "Updating standings impact..."]} />
        </Panel>
      </div>
    );
  }

  const race = { data: raceData ? raceData : undefined, loading: raceLoading };
  const weather = { data: weatherData ?? undefined, loading: weatherLoading };
  const incidents = { data: incidentsData ?? undefined, loading: incidentsLoading };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Panel label="RACE METADATA">
        {!race.data ? <EmptyState message="LOADING" /> : (
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
        {upcoming ? <NotAvailable /> : !impact.data ? <EmptyState message="LOADING" /> : (
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
          {!incidents.data?.length ? (
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
