"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import RaceCard from "@/_Components/RaceCard";
import StandingsPanel from "@/_Components/StandingsPanel";
import YearSelector from "@/_Components/YearSelector";
import { getSeasonSchedule } from "@/Api_services/races";
import { getConstructorStandings, getDriverStandings } from "@/Api_services/standings";
import type { Race } from "@/types/races";
import type { ConstructorStanding, DriverStanding } from "@/types/standings";

export default function RacesPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [drivers, setDrivers] = useState<DriverStanding[]>([]);
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);

  const stats = useMemo(() => {
    const now = new Date();

    const racesWithDate = races
      .filter((race) => race.date)
      .map((race) => ({ ...race, parsedDate: new Date(race.date as string) }))
      .filter((race) => !Number.isNaN(race.parsedDate.getTime()))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    const nextRace = racesWithDate.find((race) => race.parsedDate >= now) ?? null;
    const completedRaces = racesWithDate.filter((race) => race.parsedDate < now).length;

    return {
      totalRaces: races.length,
      completedRaces,
      driverLeader: drivers[0] ?? null,
      constructorLeader: constructors[0] ?? null,
      nextRace,
    };
  }, [constructors, drivers, races]);

  const loadSeasonData = useCallback(async (selectedYear: number) => {
    setLoading(true);
    setError(null);

    try {
      const [scheduleResponse, driversResponse, constructorsResponse] = await Promise.all([
        getSeasonSchedule(selectedYear),
        getDriverStandings(selectedYear),
        getConstructorStandings(selectedYear),
      ]);

      setRaces(scheduleResponse.races);
      setDrivers(driversResponse.drivers);
      setConstructors(constructorsResponse.constructors);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load season data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSeasonData(year);
  }, [year, loadSeasonData]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,rgba(232,0,45,0.18),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.06),transparent_30%),#050505] px-6 py-10 text-zinc-100 md:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-red-500">Phase 2</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">F1 Season Calendar</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Season schedule plus current drivers and constructors standings from the
              internal API gateway.
            </p>
          </div>
          <YearSelector year={year} onChange={setYear} />
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Calendar Progress</p>
            <p className="mt-1 text-sm text-zinc-100">
              {stats.completedRaces}/{stats.totalRaces || 0} rounds completed
            </p>
          </article>
          <article className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Driver Leader</p>
            <p className="mt-1 text-sm text-zinc-100">
              {stats.driverLeader
                ? `${stats.driverLeader.driver_name} (${stats.driverLeader.points} pts)`
                : "No standings data"}
            </p>
          </article>
          <article className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Constructor Leader</p>
            <p className="mt-1 text-sm text-zinc-100">
              {stats.constructorLeader
                ? `${stats.constructorLeader.constructor_name} (${stats.constructorLeader.points} pts)`
                : "No standings data"}
            </p>
          </article>
          <article className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Next Race</p>
            <p className="mt-1 text-sm text-zinc-100">
              {stats.nextRace ? `R${stats.nextRace.round} ${stats.nextRace.name}` : "Season complete"}
            </p>
          </article>
        </section>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-700/50 bg-red-950/30 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <StandingsPanel drivers={drivers} constructors={constructors} />

        <section className="mt-8">
          <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-400">
            Race Calendar ({races.length})
          </h2>
          {loading ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/70" />
              ))}
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {races.map((race) => (
                <RaceCard key={`${race.round}-${race.name}`} race={race} year={year} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
