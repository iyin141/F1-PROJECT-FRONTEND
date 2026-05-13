'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getCircuitSvgPathandciruitname } from "@/Lib/circuitSvg";
import { formatDate } from "@/Lib/format";
import type { Race } from "@/types/ui";

type RaceHeaderProps = {
  race: Race | undefined;
  loading: boolean;
  year: number;
  round: number;
  isSprint?: boolean;
};

export const RaceHeader = ({ race, loading, year, round, isSprint }: RaceHeaderProps) => {
  const { isDark } = useAppTheme();
  const theme = isDark ? "dark" : "light";
  const getnameandpath = race ? getCircuitSvgPathandciruitname(race.circuit.id, race.year, theme) : null;
  const circuitSvg = getnameandpath?.url ?? null;
  const name = getnameandpath?.entry?.name;

  return (
    <header className="mb-6 h-37.5 rounded-sm border border-border-subtle bg-panel p-4 sm:px-4 sm:py-2">
      {!race ? (
        <EmptyState message="RACE NOT FOUND" />
      ) : (
        <div className="flex h-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {circuitSvg && (
              <Image
                src={circuitSvg}
                alt={`${race.circuit.name} layout`}
                width={112}
                height={112}
                className="h-28 w-28 shrink-0 object-contain"
                style={{ opacity: 0.45 }}
              />
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="label-mono">ROUND {String(race.round).padStart(2, "0")} · {race.year}</p>
                {isSprint && (
                  <span
                    className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em]"
                    style={{
                      color: "hsl(var(--amber))",
                      backgroundColor: "color-mix(in srgb, hsl(var(--amber)) 15%, transparent)",
                      border: "1px solid color-mix(in srgb, hsl(var(--amber)) 30%, transparent)",
                    }}
                  >
                    <Zap size={10} /> SPRINT
                  </span>
                )}
              </div>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{race.name}</h1>
              <p className="mt-1 truncate font-mono text-xs text-text-dim">
                {name} · {race.circuit.country} · {formatDate(race.date)}
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
