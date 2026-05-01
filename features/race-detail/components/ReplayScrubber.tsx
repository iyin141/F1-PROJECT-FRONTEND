'use client';

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { Pause, Play } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { teamColor } from "@/components/DriverCode";
import { CompoundDot } from "@/components/CompoundDot";
import { Slider } from "@/components/ui/slider";
import { GenericTable, type ColumnDef, type RowVariant } from "@/components/ui/GenericTable";
import { useRaceReplay, type Speed } from "@/hooks/useRaceReplay";
import type { ReplayPosition, ReplayFrame } from "@/types/ui";
import { getDriverFlagUrl } from "@/Lib/nationality";
import { useReplayData } from "@/features/race-detail/hooks/useRaceDetail";
import { adaptReplayFrames } from "@/Lib/adapters";

gsap.registerPlugin(Flip);

// ─── Flag banner config ───────────────────────────────────────────────────────

const FLAG_BANNER: Record<string, { label: string; bg: string; text: string }> = {
  SC:     { label: "SAFETY CAR",         bg: "hsl(var(--amber))",                                            text: "var(--black)" },
  VSC:    { label: "VIRTUAL SAFETY CAR", bg: "color-mix(in srgb, hsl(var(--amber)) 70%, transparent)",      text: "var(--black)" },
  YELLOW: { label: "YELLOW FLAG",        bg: "hsl(var(--amber))",                                            text: "var(--black)" },
  RED:    { label: "RED FLAG",           bg: "hsl(var(--red))",                                              text: "hsl(var(--text))" },
  GREEN:  { label: "GREEN FLAG",         bg: "hsl(var(--green))",                                            text: "var(--black)" },
};

// ─── Row variant resolver ─────────────────────────────────────────────────────

const getRowVariant = (row: ReplayPosition): RowVariant => {
  if (row.dnf)     return "dnf";
  if (row.fastLap) return "fastlap";
  if (row.inPit)   return "pit";
  return "default";
};

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<ReplayPosition>[] = [
  {
    key: "pos",
    width: "40px",
    header: "POS",
    render: (_, idx) => (
      <span
        className="font-mono text-sm tabular-nums font-semibold"
        style={{ color: "hsl(var(--text))" }}
      >
        {idx + 1}
      </span>
    ),
  },
  {
    key: "strip",
    width: "3px",
    render: (row) => (
      <span
        aria-hidden
        className="inline-block h-7 w-[3px] rounded-sm"
        style={{ backgroundColor: teamColor(row.team) }}
      />
    ),
  },
  {
    key: "flag",
    width: "32px",
    align: "center",
    render: (row) => {
      const url = getDriverFlagUrl(row.driver, 40);
      return url ? (
        <img
          src={url}
          alt=""
          width={18}
          height={12}
          loading="lazy"
          style={{ borderRadius: "2px", objectFit: "cover" }}
        />
      ) : null;
    },
  },
  {
    key: "driver",
    width: "1fr",
    header: "DRIVER",
    render: (row) => (
      <div className="min-w-0">
        <div
          className="font-mono text-sm font-semibold tracking-wider"
          style={{ color: row.dnf ? "hsl(var(--muted))" : "hsl(var(--text))" }}
        >
          {row.driver}
        </div>
        <div
          className="truncate font-mono text-[10px] uppercase tracking-[0.15em]"
          style={{ color: "hsl(var(--muted))" }}
        >
          {row.name}
        </div>
      </div>
    ),
  },
  {
    key: "gap",
    width: "80px",
    header: "GAP",
    align: "right",
    render: (row) => (
      <span
        className="font-mono text-xs tabular-nums"
        style={{ color: row.gap === "LEADER" ? "hsl(var(--amber))" : "hsl(var(--text-dim))" }}
      >
        {row.gap}
      </span>
    ),
  },
  {
    key: "interval",
    width: "80px",
    header: "INT",
    align: "right",
    render: (row) => (
      <span
        className="font-mono text-xs tabular-nums"
        style={{ color: "hsl(var(--muted))" }}
      >
        {row.interval}
      </span>
    ),
  },
  {
    key: "tyre",
    width: "80px",
    header: "TYRE",
    render: (row) => (
      <div className="flex items-center gap-1.5">
        <CompoundDot compound={row.tyre} />
        <span
          className="font-mono text-[10px] tabular-nums"
          style={{ color: "hsl(var(--muted))" }}
        >
          L{row.tyreLap}
        </span>
      </div>
    ),
  },
  {
    key: "pit",
    width: "52px",
    header: "PIT",
    align: "right",
    render: (row) => (
      <span
        className="font-mono text-[10px] font-bold tracking-[0.2em]"
        style={{ color: row.inPit ? "hsl(var(--amber))" : "hsl(var(--muted))" }}
      >
        {row.inPit ? "PIT" : "—"}
      </span>
    ),
  },
];

// ─── ReplayScrubber ───────────────────────────────────────────────────────────

export const ReplayScrubber = ({ year, round, enabled }: { year: number; round: number; enabled: boolean }) => {
  const { positions, pitStops, isPending: loading } = useReplayData(year, round, enabled);
  const frames = adaptReplayFrames(positions.data, pitStops.data);

  const r = useRaceReplay(frames ?? []);
  const towerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = towerRef.current;
    if (!el || !r.frame) return;
    const state = Flip.getState(el.querySelectorAll("[data-flip-id]"));
    requestAnimationFrame(() => {
      if (!towerRef.current) return;
      Flip.from(state, { duration: 0.45, ease: "power2.inOut", absolute: false });
    });
  }, [r.frame?.lap]);

  if (!enabled || loading) return <Skeleton className="h-[32rem]" />;

  if (!frames.length || !r.frame) {
    return (
      <p className="font-mono text-sm" style={{ color: "hsl(var(--muted))" }}>
        No replay data for this race.
      </p>
    );
  }

  const banner =
    r.frame.flag && r.frame.flag !== "GREEN" ? FLAG_BANNER[r.frame.flag] : null;
  const progress = (r.lap / r.totalLaps) * 100;

  return (
    <div className="space-y-4">
      {/* Lap header */}
      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: "var(--surface)", borderColor: "hsl(var(--border-subtle))" }}
      >
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display text-3xl"
              style={{ color: "hsl(var(--text))" }}
            >
              LAP {r.lap}
            </span>
            <span
              className="font-mono text-xs"
              style={{ color: "hsl(var(--muted))" }}
            >
              / {r.totalLaps}
            </span>
          </div>
          {banner && (
            <span
              className="rounded-sm px-3 py-1 font-mono text-[10px] font-bold tracking-[0.2em]"
              style={{ backgroundColor: banner.bg, color: banner.text }}
            >
              {banner.label}
            </span>
          )}
        </div>
        <div
          className="relative h-1 overflow-hidden rounded-full"
          style={{ backgroundColor: "var(--surface2)" }}
        >
          <div
            className="absolute left-0 top-0 h-full transition-[width]"
            style={{ width: `${progress}%`, backgroundColor: "hsl(var(--red))" }}
          />
        </div>
      </div>

      {/* Tower */}
      <div ref={towerRef}>
        <GenericTable<ReplayPosition>
          className="data-grid w-full min-w-[36rem] font-mono text-xs md:min-w-[48rem]"
          columns={columns}
          data={r.frame.positions}
          getRowKey={(row) => row.driver}
          getRowVariant={getRowVariant}
          // pass data-flip-id via className so GSAP Flip can track DOM nodes
          getRowClassName={(row) => `[&>[data-flip-id]]:flex data-[driver="${row.driver}"]`}
        />
      </div>

      {/* Controls */}
      <div
        className="flex items-center gap-4 rounded-full border px-4 py-3"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "hsl(var(--border-subtle))",
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
        }}
      >
        <button
          onClick={r.toggle}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-90"
          style={{ backgroundColor: "hsl(var(--red))" }}
          aria-label={r.playing ? "Pause" : "Play"}
        >
          {r.playing
            ? <Pause className="h-4 w-4" style={{ color: "hsl(var(--text))" }} />
            : <Play  className="ml-0.5 h-4 w-4" style={{ color: "hsl(var(--text))" }} />}
        </button>

        <div className="min-w-[120px] flex-1">
          <Slider
            value={[r.lap]}
            min={1}
            max={r.totalLaps}
            step={1}
            onValueChange={(v) => r.setLap(v[0])}
          />
        </div>

        <div
          className="flex gap-1 rounded-full border p-1"
          style={{
            backgroundColor: "var(--surface2)",
            borderColor: "hsl(var(--border-subtle))",
          }}
        >
          {([1, 2, 4] as Speed[]).map((s) => (
            <button
              key={s}
              onClick={() => r.setSpeed(s)}
              className="rounded-full px-3 py-1 font-mono text-[11px] tracking-[0.2em] transition-colors"
              style={{
                backgroundColor: r.speed === s ? "hsl(var(--text))" : "transparent",
                color: r.speed === s ? "var(--black)" : "hsl(var(--muted))",
              }}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
