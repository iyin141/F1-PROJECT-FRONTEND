'use client';

import Link from "next/link";
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
}: Props) => (
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
          {race.circuit.name} · {race.circuit.country}
        </p>
      )}
    </div>

    {onSessionChange && availableSessions && availableSessions.length > 0 && (
      <div className="flex items-center gap-2">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.22em]"
          style={{ color: "hsl(var(--muted))" }}
        >
          SESSION
        </span>
        <select
          value={session ?? "R"}
          onChange={(e) => onSessionChange(e.target.value)}
          className="border border-border-subtle px-3 py-1.5 font-mono text-[11px] tracking-[0.06em] outline-none cursor-pointer"
          style={{ backgroundColor: "hsl(var(--bg))", color: "hsl(var(--text))" }}
        >
          {availableSessions.map((s) => (
            <option key={s.code} value={s.code} style={{ backgroundColor: "hsl(var(--bg))" }}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    )}
  </header>
);
