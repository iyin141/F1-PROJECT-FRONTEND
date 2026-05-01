'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getCircuitSvgPath } from "@/Lib/circuitSvg";
import { formatDate } from "@/Lib/format";
import type { Race } from "@/types/ui";

type RaceHeaderProps = {
  race: Race | undefined;
  loading: boolean;
  year: number;
  round: number;
};

export const RaceHeader = ({ race, loading, year, round }: RaceHeaderProps) => {
  const { isDark } = useAppTheme();
  const theme = isDark ? "dark" : "light";
  const circuitSvg = race ? getCircuitSvgPath(race.circuit.id, race.year, theme) : null;

  return (
    <header className="mb-6 h-[150px] rounded-sm border border-border-subtle bg-panel p-4 sm:px-4 sm:py-2">
      {loading ? (
        <Skeleton className="h-16" />
      ) : !race ? (
        <EmptyState message="RACE NOT FOUND" />
      ) : (
        <div className="flex h-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {circuitSvg && (
              <img
                src={circuitSvg}
                alt={`${race.circuit.name} layout`}
                className="h-28 w-28 shrink-0 object-contain"
                style={{ opacity: 0.45 }}
              />
            )}

            <div className="min-w-0">
              <p className="label-mono">ROUND {String(race.round).padStart(2, "0")} · {race.year}</p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{race.name}</h1>
              <p className="mt-1 truncate font-mono text-xs text-text-dim">
                {race.circuit.name} · {race.circuit.country} · {formatDate(race.date)}
              </p>
            </div>
          </div>

          {race.status === "completed" && (
            <Link
              href={`/race/${year}/${round}/analysis`}
              className="inline-flex mt-10 items-center gap-2 border border-red bg-red/10 px-4 py-2 font-mono text-xs tracking-wider text-red transition-colors hover:bg-red hover:text-white"
            >
              OPEN ANALYSIS <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
