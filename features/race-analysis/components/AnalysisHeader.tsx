'use client';

import Link from "next/link";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getCircuitSvgPathandciruitname } from "@/Lib/circuitSvg";
import { SessionSelector } from "./SessionSelector";
import type { Race } from "@/types/ui";

type Props = {
  race: Race | undefined;
  year: number;
  round: number;
  session?: string;
  onSessionChange?: (s: string) => void;
  availableSessions?: Array<{ code: string; label: string }>;
};

export const AnalysisHeader = ({
  race,
  year,
  round,
  session,
  onSessionChange,
  availableSessions,
}: Props) => {
  const { isDark } = useAppTheme();
  const theme = isDark ? "dark" : "light";

  const getnameandpath = race ? getCircuitSvgPathandciruitname(race.circuit.id, race.year, theme) : null;
  const circuitName = getnameandpath?.entry.name
  


  return (
    <header className="mb-8 border-b border-border-subtle pb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
      <div>
        <div
          className="mb-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em]"
          style={{ color: "hsl(var(--muted))" }}
        >
          <Link
            href={`/race/${year}/${round}`}
            style={{ color: "hsl(var(--muted))" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "hsl(var(--text-dim))";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "hsl(var(--muted))";
            }}
          >
            ← RACE DETAIL
          </Link>
          <span>·</span>
          <span>RND {String(round).padStart(2, "0")} · {year}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {race?.name ?? <span className="inline-block h-8 w-72" />}
          </h1>
          <span
            className="font-mono text-[12px] uppercase tracking-[0.16em]"
            style={{ color: "hsl(var(--red))" }}
          >
            · ANALYSIS
          </span>
        </div>
        {race && (
          <p className="mt-1 font-mono text-[10px]" style={{ color: "hsl(var(--muted))" }}>
            {circuitName} · {race.circuit.country}
          </p>
        )}
      </div>

      {onSessionChange && availableSessions && availableSessions.length > 0 && (
        <SessionSelector
          value={session ?? "R"}
          onChange={onSessionChange}
          availableSessions={availableSessions}
        />
      )}
    </header>
  );
};
