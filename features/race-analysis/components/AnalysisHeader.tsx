'use client';

import Link from "next/link";
import { Skeleton } from "@/components/Skeleton";
import type { Race } from "@/types/ui";

type Props = { race: Race | undefined; year: number; round: number };

export const AnalysisHeader = ({ race, year, round }: Props) => (
  <header className="mb-8 border-b border-border-subtle pb-6">
    <div
      className="mb-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]"
      style={{ color: "hsl(var(--muted))" }}
    >
      <Link
        href={`/race/${year}/${round}`}
        style={{ color: "hsl(var(--muted))" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "hsl(var(--text-dim))"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "hsl(var(--muted))"; }}
      >
        ← RACE DETAIL
      </Link>
      <span>·</span>
      <span>RND {String(round).padStart(2, "0")} · {year}</span>
    </div>
    <div className="flex items-baseline gap-3">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {race?.name ?? <Skeleton className="inline-block h-8 w-72" />}
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
  </header>
);
