"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { Panel } from "@/components/Panel";
import { Skeleton } from "@/components/Skeleton";
import { DriverCode } from "@/components/DriverCode";
import { YearNavigator } from "@/components/ui/YearNavigator";
import { DRIVERS, TEAMS } from "@/Lib/data/drivers";
import { useDriverStandings } from "@/features/season-hub/hooks/useSeasonHub";
import { useDriverSearch } from "@/features/drivers-hub/hooks/useDrivers";
import { useNavStore } from "@/_Stores/navStore";
import { DriverRecordShell } from "@/features/driver-record/components/DriverRecordShell";
import { NationalityFlag } from "@/_Components/ui/NationalityFlag";
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
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const expandRef = useRef<HTMLDivElement>(null);
  const setDriversYear = useNavStore((s) => s.setDriversYear);
  const storeDriversYear = useNavStore((s) => s.driversYear);

  useEffect(() => {
    setDriversYear(year);
  }, [year, setDriversYear]);

  const effectiveYear = storeDriversYear ?? year;
  const { data: standingsData, isLoading: standingsLoading, isFetching: standingsFetching } = useDriverStandings(effectiveYear);
  const { data: searchResults, isLoading: searchLoading, isFetching: searchFetching } = useDriverSearch(submittedSearch);
  const minYear = 1950;

  const { drivers, source, loading } = useMemo(() => {
    if (submittedSearch) {
      if (searchLoading || searchFetching) {
        return { drivers: [], source: "loading" as const, loading: true };
      }
      const safeResults = Array.isArray(searchResults) ? searchResults : searchResults?.data || searchResults?.results || [];
      const adaptedSearchDrivers = safeResults.map((item: any) => ({
        code: (item.driver_code || item.driver_id || item.code || "UNK").slice(0, 3).toUpperCase(),
        firstName: item.driver_name ? item.driver_name.split(' ')[0] : item.firstName,
        lastName: item.driver_name ? item.driver_name.split(' ').slice(1).join(' ') : item.lastName,
        nationality: item.nationality,
        team: item.team || "Unknown",
        seasons: item.seasons || [],
      }));
      return { drivers: adaptedSearchDrivers, source: "search" as const, loading: false };
    }

    if (standingsData) {
      const safeStandings = Array.isArray(standingsData) ? standingsData : [];
      const standingsDrivers = safeStandings.map((row: any) => row.driver);
      const unique = dedupeDrivers(standingsDrivers).sort((a, b) => a.lastName.localeCompare(b.lastName));
      return { drivers: unique, source: "standings" as const, loading: false };
    }
    if (standingsLoading || standingsFetching) {
      return { drivers: [], source: "loading" as const, loading: true };
    }
    const fallbackDrivers = dedupeDrivers(DRIVERS).sort((a, b) => a.lastName.localeCompare(b.lastName));
    return { drivers: fallbackDrivers, source: "fallback" as const, loading: false };
  }, [submittedSearch, searchResults, searchLoading, searchFetching, standingsData, standingsLoading, standingsFetching]);

  const filtered = useMemo(() => {
    const safeDrivers = Array.isArray(drivers) ? drivers : [];
    if (submittedSearch) return safeDrivers;
    const term = search.trim().toLowerCase();
    if (!term) return safeDrivers;
    return safeDrivers.filter((driver) => {
      const teamName = TEAMS[driver.team as keyof typeof TEAMS]?.name.toLowerCase() ?? "";
      return (
        driver.code.toLowerCase().includes(term) ||
        driver.firstName.toLowerCase().includes(term) ||
        driver.lastName.toLowerCase().includes(term) ||
        `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(term) ||
        teamName.includes(term)
      );
    });
  }, [drivers, search, submittedSearch]);

  const handleCardClick = (code: string) => {
    if (selectedCode === code) {
      setSelectedCode(null);
    } else {
      setSelectedCode(code);
      // Scroll to expanded panel after render
      setTimeout(() => {
        expandRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  };

  return (
    <main className="page-shell w-full">
      <section className="mb-6 text-center">
        <p className="label-mono">WELCOME</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-text sm:text-5xl">
          Driver Archive
        </h1>
        <p className="mx-auto mt-2 max-w-2xl font-mono text-xs uppercase tracking-[0.16em] text-text-dim">
          Click a driver card to expand their record inline.
        </p>
      </section>

      <div className="mx-auto mb-6 max-w-2xl">
        <label className="sr-only" htmlFor="drivers-search">Search drivers</label>
        <form
          className="relative flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedSearch(search.trim());
          }}
        >
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" aria-hidden />
            <input
              id="drivers-search"
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                if (!event.target.value.trim()) {
                  setSubmittedSearch(""); // auto-clear backend search if empty
                }
              }}
              placeholder="Search drivers, code, or team"
              className="w-full border border-border-subtle bg-panel py-3 pl-9 pr-3 font-mono text-sm text-text outline-none transition-colors placeholder:text-text-dim focus:border-border"
            />
          </div>
          <button
            type="submit"
            className="border border-border-subtle bg-panel px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-text hover:bg-surface2 transition-colors"
          >
            SEARCH
          </button>
        </form>
      </div>

      <Panel
        label="DRIVERS"
        title={`${source === "search" ? "Search Results" : source === "standings" ? "Season Roster" : source === "loading" ? "Loading" : "Driver List"} · ${effectiveYear}`}
        action={
          <YearNavigator
            year={effectiveYear}
            minYear={minYear}
            onNavigate={(nextYear) => {
              setSelectedCode(null);
              setDriversYear(nextYear);
              window.history.replaceState(null, "", `/drivers?year=${nextYear}`);
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
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border border-border-subtle p-3">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="ml-auto h-4 w-20" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center font-mono text-xs uppercase tracking-[0.18em] text-text-dim">
            No drivers match your search.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((driver) => {
              const isSelected = selectedCode === driver.code;
              const team = TEAMS[driver.team as keyof typeof TEAMS];
              return (
                <button
                  key={driver.code}
                  onClick={() => handleCardClick(driver.code)}
                  aria-pressed={isSelected}
                  className={[
                    "group flex items-center justify-between border p-3 text-left transition-colors",
                    isSelected
                      ? "border-red bg-panel-elev"
                      : "border-border-subtle hover:border-border hover:bg-panel-elev",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-base font-bold tracking-wider text-text w-14 shrink-0 truncate">
                      {driver.code}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-mono text-[11px] tracking-[0.06em] text-text">
                        {driver.firstName} {driver.lastName}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
                        {team?.shortName ?? driver.team}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {driver.seasons && driver.seasons.length > 0 && (
                      <div className="hidden sm:flex flex-col text-right">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
                          {driver.seasons.length} {driver.seasons.length === 1 ? "Season" : "Seasons"}
                        </span>
                        <span className="font-mono text-[9px] text-text-dim/50">
                          {Math.min(...driver.seasons) === Math.max(...driver.seasons) 
                            ? Math.min(...driver.seasons) 
                            : `${Math.min(...driver.seasons)} - ${Math.max(...driver.seasons)}`}
                        </span>
                      </div>
                    )}
                    {driver.nationality && (
                      <NationalityFlag driverCode={driver.code} nationality={driver.nationality} size={20} className="w-[14px] h-[10px] opacity-80" />
                    )}
                    {isSelected ? (
                      <span
                        className="font-mono text-[9px] uppercase tracking-[0.16em]"
                        style={{ color: "hsl(var(--red))" }}
                      >
                        ▲ CLOSE
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-transparent group-hover:text-text-dim transition-colors">
                        ▼ OPEN
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Panel>

      {selectedCode && (
        <div ref={expandRef} className="mt-6 border border-border-subtle">
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim">
              DRIVER RECORD · {selectedCode} · {effectiveYear}
            </span>
            <button
              onClick={() => setSelectedCode(null)}
              className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-dim transition-colors hover:text-text"
            >
              <X size={12} />
              CLOSE
            </button>
          </div>
          <div className="p-5">
            <DriverRecordShell driverCode={selectedCode} year={effectiveYear} />
          </div>
        </div>
      )}
    </main>
  );
}
