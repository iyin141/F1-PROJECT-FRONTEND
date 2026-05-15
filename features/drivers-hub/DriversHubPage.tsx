"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Panel } from "@/components/Panel";
import { Skeleton } from "@/components/Skeleton";
import { DriverCode } from "@/components/DriverCode";
import { YearNavigator } from "@/components/ui/YearNavigator";
import { DRIVERS, TEAMS } from "@/Lib/data/drivers";
import { useDriverStandings } from "@/features/season-hub/hooks/useSeasonHub";
import { useNavStore } from "@/_Stores/navStore";
import type { Driver } from "@/types/ui";

function dedupeDrivers(drivers: Driver[]) {
  const seen = new Set<string>();
  const unique: Driver[] = [];

  for (const driver of drivers) {
    if (seen.has(driver.code)) continue;
    seen.add(driver.code);
    unique.push(driver);
  }

  return unique;
}

type DriversHubPageProps = {
  year: number;
};

export function DriversHubPage({ year }: DriversHubPageProps) {
  const [search, setSearch] = useState("");
  const setDriversYear = useNavStore((s) => s.setDriversYear);
  const storeDriversYear = useNavStore((s) => s.driversYear);

  useEffect(() => {
    setDriversYear(year);
  }, [year, setDriversYear]);

  const effectiveYear = storeDriversYear ?? year;
  const { data: standingsData, isLoading: standingsLoading, isFetching: standingsFetching } = useDriverStandings(effectiveYear);
  const minYear = 1950;

  const { drivers, source, loading } = useMemo(() => {
    if (standingsData) {
      const standingsDrivers = standingsData.map((row) => row.driver);
      const unique = dedupeDrivers(standingsDrivers).sort((a, b) =>
        a.lastName.localeCompare(b.lastName),
      );
      return { drivers: unique, source: "standings" as const, loading: false };
    }

    if (standingsLoading || standingsFetching) {
      return { drivers: [], source: "loading" as const, loading: true };
    }

    // No standings and not currently loading/fetching — show local fallback
    const fallbackDrivers = dedupeDrivers(DRIVERS).sort((a, b) =>
      a.lastName.localeCompare(b.lastName),
    );
    return { drivers: fallbackDrivers, source: "fallback" as const, loading: false };
  }, [standingsData, standingsLoading, standingsFetching]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return drivers;

    return drivers.filter((driver) => {
      const teamName = TEAMS[driver.team].name.toLowerCase();
      return (
        driver.code.toLowerCase().includes(term) ||
        driver.firstName.toLowerCase().includes(term) ||
        driver.lastName.toLowerCase().includes(term) ||
        `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(term) ||
        teamName.includes(term)
      );
    });
  }, [drivers, search]);

  return (
    <main className="page-shell w-full">
      <section className="mb-6 text-center">
        <p className="label-mono">WELCOME</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-text sm:text-5xl">
          Driver Archive
        </h1>
        <p className="mx-auto mt-2 max-w-2xl font-mono text-xs uppercase tracking-[0.16em] text-text-dim">
          Search by code, name, or team and jump straight into a driver record.
        </p>
      </section>

      <div className="mx-auto mb-6 max-w-2xl">
        <label className="sr-only" htmlFor="drivers-search">
          Search drivers
        </label>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
            aria-hidden
          />
          <input
            id="drivers-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search drivers, code, or team"
            className="w-full rounded-sm border border-border-subtle bg-panel py-3 pl-9 pr-3 font-mono text-sm text-text outline-none transition-colors placeholder:text-text-dim focus:border-border"
          />
        </div>
      </div>

      <Panel
        label="DRIVERS"
        title={`${source === "standings" ? "Standings" : source === "loading" ? "Loading" : "Fallback"} List · ${year}`}
        action={
          <YearNavigator
            year={effectiveYear}
            minYear={minYear}
            onNavigate={(nextYear) => {
              setDriversYear(nextYear);
              window.history.replaceState(null, "", `/drivers/year/${nextYear}`);
            }}
          />
        }
      >
        {source === "fallback" && (
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
            No cached standings found for this year. Showing static local driver list.
          </p>
        )}

        {loading ? (
          <ul className="divide-y divide-border-subtle border border-border-subtle">
            {Array.from({ length: 20 }).map((_, i) => (
              <li key={i} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center font-mono text-xs uppercase tracking-[0.18em] text-text-dim">
            No drivers match your search.
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle border border-border-subtle">
            {filtered.map((driver) => (
              <li key={driver.code}>
                <Link
                    href={`/drivers/${driver.code}/${effectiveYear}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-panel-elev"
                >
                  <DriverCode driver={driver} showName />
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-dim">
                    {TEAMS[driver.team].shortName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </main>
  );
}
