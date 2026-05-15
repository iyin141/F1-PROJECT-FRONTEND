'use client';

import { useMemo, useState, useTransition } from "react";
import FadeInPanel from "@/components/animations/FadeInPanel";
import Link from "next/link";
import { ArrowRight, Calendar, Cloud, CloudRain, Sun } from "lucide-react";
import { DriverCode } from "@/components/DriverCode";
import { EmptyState } from "@/components/EmptyState";
import { Panel } from "@/components/Panel";
import { GenericTable, type ColumnDef } from "@/components/ui/GenericTable";
import { formatDate } from "@/Lib/format";
import type { Incident, QualifyingResult, Race, RaceResult, WeatherSnapshot } from "@/types/ui";

const raceColumns: ColumnDef<RaceResult>[] = [
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
  {
    key: "fastestLapTime",
    width: "2fr",
    header: "BEST LAP",
    align: "right",
    render: r => <span className="truncate text-text-dim tabular-nums">{r.fastestLapTime ?? "—"}</span>,
  },
];

const qualifyingColumns: ColumnDef<QualifyingResult>[] = [
  {
    key: "position",
    width: "1fr",
    header: "POS",
    render: q => <span className="tabular-nums">{q.position}</span>,
  },
  {
    key: "driver",
    width: "5fr",
    header: "DRIVER",
    render: q => <div className="min-w-0"><DriverCode driver={q.driver} showName /></div>,
  },
  {
    key: "q1",
    width: "2fr",
    header: "Q1",
    align: "right",
    render: q => <span className="truncate text-text-dim tabular-nums">{q.q1 ?? "—"}</span>,
  },
  {
    key: "q2",
    width: "2fr",
    header: "Q2",
    align: "right",
    render: q => <span className="truncate text-text-dim tabular-nums">{q.q2 ?? "—"}</span>,
  },
  {
    key: "q3",
    width: "2fr",
    header: "Q3",
    align: "right",
    render: q => <span className="truncate text-text-dim tabular-nums">{q.q3 ?? "—"}</span>,
  },
];

const WeatherIcon = ({ condition }: { condition: WeatherSnapshot["conditions"] }) =>
  condition === "Wet" ? <CloudRain size={14} /> : condition === "Cloudy" ? <Cloud size={14} /> : <Sun size={14} />;

type LastRacePanelProps = {
  race: Race | undefined;
  results: RaceResult[] | undefined;
  qualiResults: QualifyingResult[] | undefined;
  incidents: Incident[] | undefined;
  weather: WeatherSnapshot | null | undefined;
  loading: boolean;
};

/**
 * Format a UTC date string for session schedule display.
 * Returns "Mon 15 Mar, 14:00" style.
 */
function formatSessionDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }) + ", " + d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return dateStr;
  }
}

export const LastRacePanel = ({ race, results, qualiResults, incidents, weather, loading }: LastRacePanelProps) => {
  const [activeView, setActiveView] = useState<"race" | "quali">("race");
  const [isPending, startTransition] = useTransition();
  const scCount = (incidents ?? []).filter(i => i.type === "SC" || i.type === "VSC").length;
  const isUpcoming = race && (race.status === "upcoming" || race.status === "live");
  const hasResults = results && results.length > 0;
  const hasQualifying = Boolean(qualiResults?.length);
  const visibleRaceResults = useMemo(() => results?.slice(0, 10) ?? [], [results]);
  const visibleQualifyingResults = useMemo(() => qualiResults?.slice(0, 10) ?? [], [qualiResults]);

  // When there are no results, show the upcoming race schedule
  if (!loading && !hasResults && race && isUpcoming) {
    return (
      <FadeInPanel>
        <Panel
          label={race.status === "live" ? "LIVE RACE" : "NEXT RACE"}
          title={race.name}
          action={
            <Link
              href={`/race/${race.year}/${race.round}`}
              className="inline-flex items-center gap-2 border border-red bg-red/10 px-3 py-1.5 font-mono text-[11px] tracking-wider text-red transition-colors hover:bg-red hover:text-white"
            >
              VIEW RACE <ArrowRight size={12} />
            </Link>
          }
        >
          <div className="space-y-4">
            {/* Race date header */}
            <div className="flex items-center gap-2 font-mono text-xs text-text-dim">
              <Calendar size={14} />
              <span>{formatDate(race.date)}</span>
              <span>·</span>
              <span>{race.circuit.name}</span>
              <span>·</span>
              <span>{race.circuit.country}</span>
            </div>

            {/* Session schedule from session1–session5 */}
            {race.sessions.length > 0 ? (
              <div className="space-y-1">
                <div className="label-mono mb-2">SESSION SCHEDULE</div>
                {race.sessions.map((session, idx) => {
                  const sessionLabel = session.id.toUpperCase().replace("FP", "PRACTICE ").replace("QUALIFYING", "QUALIFYING").replace("RACE", "RACE");
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-sm border border-border-subtle/50 px-3 py-2 font-mono text-xs"
                    >
                      <span
                        className="font-semibold uppercase tracking-wider"
                        style={{ color: session.id === "race" ? "hsl(var(--red))" : "hsl(var(--text))" }}
                      >
                        {sessionLabel}
                      </span>
                      <span className="tabular-nums text-text-dim">
                        {session.startsAt ? formatSessionDate(session.startsAt) : "TBC"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center font-mono text-xs text-text-dim">
                Session schedule will be available closer to the race weekend.
              </div>
            )}
          </div>
        </Panel>
      </FadeInPanel>
    );
  }

  return (
    <FadeInPanel>
      <Panel
        label="LAST RACE"
        title={race?.name}
        action={
          race && (
            <Link
              href={`/race/${race.year}/${race.round}`}
              className="inline-flex items-center gap-2 border border-red bg-red/10 px-3 py-1.5 font-mono text-[11px] tracking-wider text-red transition-colors hover:bg-red hover:text-white"
            >
              VIEW MORE <ArrowRight size={12} />
            </Link>
          )
        }
      >
        {!results?.length ? (
          <EmptyState message="NO RESULTS" />
        ) : (
          <>
            {hasQualifying && (
              <div className={`mb-3 flex border-b border-border-subtle ${isPending ? "pointer-events-none opacity-70" : ""}`}>
                <button
                  type="button"
                  onClick={() => startTransition(() => setActiveView("race"))}
                  className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                    activeView === "race"
                      ? "border-b border-red text-red"
                      : "text-text-dim hover:text-text"
                  }`}
                >
                  Race
                </button>
                <button
                  type="button"
                  onClick={() => startTransition(() => setActiveView("quali"))}
                  className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                    activeView === "quali"
                      ? "border-b border-red text-red"
                      : "text-text-dim hover:text-text"
                  }`}
                >
                  Qualifying
                </button>
              </div>
            )}
            <div className="panel-scroll w-full">
              {activeView === "quali" && hasQualifying ? (
                <GenericTable<QualifyingResult>
                  className="data-grid w-full min-w-xl font-mono text-xs md:min-w-2xl"
                  columns={qualifyingColumns}
                  data={visibleQualifyingResults}
                  getRowKey={q => q.driver.id}
                  striped
                  getRowVariant={q => (q.position === 1 ? "pole" : "default")}
                />
              ) : (
                <GenericTable<RaceResult>
                  className="data-grid w-full min-w-xl font-mono text-xs md:min-w-2xl"
                  columns={raceColumns}
                  data={visibleRaceResults}
                  getRowKey={r => r.driver.id}
                  striped
                  getRowVariant={r => {
                    if (r.position === 1) return "pole";
                    if (r.fastestLap) return "fastlap";
                    return "default";
                  }}
                />
              )}
            </div>
            {activeView === "race" && (
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
            )}
          </>
        )}
      </Panel>
    </FadeInPanel>
  );
};
