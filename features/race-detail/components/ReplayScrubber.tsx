'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { Pause, Play } from "lucide-react";
import { teamColor } from "@/components/DriverCode";
import { CompoundDot } from "@/components/CompoundDot";
import { Slider } from "@/components/ui/slider";
import { GenericTable, type ColumnDef, type RowVariant } from "@/components/ui/GenericTable";
import { useRaceReplay, type Speed } from "@/hooks/useRaceReplay";
import type { ReplayPosition, FlagType, Compound } from "@/types/ui";
import { getDriverFlagUrl } from "@/Lib/nationality";
import { useReplayFrames } from "@/features/race-detail/hooks/useRaceDetail";

gsap.registerPlugin(Flip);

// ─── Flag banner config ───────────────────────────────────────────────────────

const FLAG_BANNER: Record<string, { label: string; bg: string; text: string }> = {
  SC:     { label: "SAFETY CAR",         bg: "hsl(var(--amber))",                                            text: "var(--black)" },
  VSC:    { label: "VIRTUAL SAFETY CAR", bg: "color-mix(in srgb, hsl(var(--amber)) 70%, transparent)",      text: "var(--black)" },
  YELLOW: { label: "YELLOW FLAG",        bg: "hsl(var(--amber))",                                            text: "var(--black)" },
  RED:    { label: "RED FLAG",           bg: "hsl(var(--red))",                                              text: "hsl(var(--text))" },
};

const INCIDENT_STYLE: Record<string, { bg: string; text: string }> = {
  RED:          { bg: "hsl(var(--red) / 0.15)",   text: "hsl(var(--red))" },
  SC:           { bg: "hsl(var(--amber) / 0.15)", text: "hsl(var(--amber))" },
  VSC:          { bg: "hsl(var(--amber) / 0.15)", text: "hsl(var(--amber))" },
  SAFETY_CAR:   { bg: "hsl(var(--amber) / 0.15)", text: "hsl(var(--amber))" },
  YELLOW:       { bg: "hsl(var(--amber) / 0.15)", text: "hsl(var(--amber))" },
  DEFAULT:      { bg: "var(--surface2)",           text: "hsl(var(--text-dim))" },
};

// ─── Row variant resolver ─────────────────────────────────────────────────────

const getRowVariant = (row: ReplayPosition): RowVariant => {
  if (row.status === "DNF" || row.status === "DNS") return "dnf";
  if (row.inPit) return "pit";
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
        className="inline-block h-7 w-0.75 rounded-sm"
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
        <Image
          src={url}
          alt=""
          width={18}
          height={12}
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
        <div className="flex items-center gap-2">
          <div
            className="font-mono text-sm font-semibold tracking-wider"
            style={{ color: "hsl(var(--text))" }}
          >
            {row.driver}
            {row.driverNumber != null && (
              <span className="ml-1 text-[10px]" style={{ color: "hsl(var(--muted))" }}>
                #{row.driverNumber}
              </span>
            )}
          </div>
          {row.status && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: row.status === "DNF" ? "hsl(var(--red) / 0.2)" : "hsl(var(--muted) / 0.2)",
                color: row.status === "DNF" ? "hsl(var(--red))" : "hsl(var(--muted))",
              }}
            >
              {row.status}
            </span>
          )}
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
    key: "stints",
    width: "120px",
    header: "STINTS",
    render: (row) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-0.5">
          {row.stints.map((compound, idx) => {
            const isCurrent = idx === row.stints.length - 1;
            return (
              <div
                key={idx}
                style={{
                  opacity: isCurrent ? 1 : 0.35,
                  transform: isCurrent ? "scale(1.15)" : "none",
                  transition: "opacity 0.2s",
                }}
              >
                <CompoundDot compound={compound} />
              </div>
            );
          })}
        </div>
        <span
          className="font-mono text-[9px] tabular-nums"
          style={{ color: "hsl(var(--muted))" }}
        >
          {row.tyreLap > 0 ? `L${row.tyreLap}` : "—"}
        </span>
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
    key: "delta",
    width: "62px",
    header: "DELTA",
    align: "right",
    render: (row) => {
      const v = row.positionChange;
      const text = v == null ? "—" : v > 0 ? `+${v}` : `${v}`;
      const color =
        v == null
          ? "hsl(var(--muted))"
          : v > 0
            ? "hsl(var(--green))"
            : v < 0
              ? "hsl(var(--red))"
              : "hsl(var(--text-dim))";

      return (
        <span className="font-mono text-xs tabular-nums" style={{ color }}>
          {text}
        </span>
      );
    },
  },
  {
    key: "last",
    width: "80px",
    header: "LAST",
    align: "right",
    render: (row) => (
      <span className="font-mono text-xs tabular-nums" style={{ color: "hsl(var(--text-dim))" }}>
        {row.lastLapTime ?? "—"}
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
    width: "140px",
    header: "PIT",
    align: "right",
    render: (row) => (
      <div className="flex items-center justify-end gap-2 font-mono text-[10px] tabular-nums">
        <span
          className="font-bold tracking-[0.2em]"
          style={{ color: row.inPit ? "hsl(var(--amber))" : "hsl(var(--muted))" }}
        >
          {row.inPit ? "PIT" : "—"}
        </span>
        <span style={{ color: "hsl(var(--muted))" }}>
          {row.stopNumber != null ? `S${row.stopNumber}` : "—"}
        </span>
        <span style={{ color: "hsl(var(--text-dim))" }}>
          {row.pitDurationSeconds != null ? `${row.pitDurationSeconds.toFixed(3)}s` : "—"}
        </span>
      </div>
    ),
  },
];

// ─── ReplayScrubber ───────────────────────────────────────────────────────────

export const ReplayScrubber = ({ year, round, enabled }: { year: number; round: number; enabled: boolean }) => {
  const { frames, positions, incidents, pitStops, laps, isPending: loading } = useReplayFrames(year, round, enabled);

  const r = useRaceReplay(frames ?? []);  
  const towerRef = useRef<HTMLDivElement>(null);
  const [bannerTick, setBannerTick] = useState(0);
  const flagSequenceLength = r.frame?.flagSequence?.length ?? 0;

  useEffect(() => {
    const el = towerRef.current;
    if (!el || !r.frame) return;
    const state = Flip.getState(el.querySelectorAll("[data-flip-id]"));
    requestAnimationFrame(() => {
      if (!towerRef.current) return;
      Flip.from(state, { duration: 0.45, ease: "power2.inOut", absolute: false });
    });
  }, [r.frame]);

  useEffect(() => {
    if (flagSequenceLength <= 1) return;

    const timer = window.setInterval(() => {
      setBannerTick((v) => v + 1);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [r.frame?.lap, flagSequenceLength]);

  if (!enabled || loading) return null;

  if (!frames.length || !r.frame) {
    return (
      <p className="font-mono text-sm" style={{ color: "hsl(var(--muted))" }}>
        No replay data for this race.
      </p>
    );
  }

  const sequence = r.frame.flagSequence ?? [];
  const activeFlag: FlagType | undefined =
    sequence.length > 0
      ? sequence[bannerTick % sequence.length]
      : r.frame.flag;
  const banner = activeFlag && FLAG_BANNER[activeFlag] ? FLAG_BANNER[activeFlag] : null;
  const progress = (r.lap / r.totalLaps) * 100;
  const lapIncidents = r.frame.lapIncidents ?? [];

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

        {/* Lap incidents */}
        {lapIncidents.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
            {lapIncidents.map((inc, i) => {
              const key = (inc.flag ?? inc.type ?? "DEFAULT").toUpperCase().replace(/\s+/g, "_");
              const style = INCIDENT_STYLE[key] ?? INCIDENT_STYLE.DEFAULT;
              return (
                <div
                  key={i}
                  className="flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px]"
                  style={{ backgroundColor: style.bg, color: style.text }}
                >
                  {inc.drivers?.length ? `${inc.drivers.slice(0, 2).join("/")} — ` : ""}
                  {inc.message?.slice(0, 45) ?? inc.type}
                </div>
              );
            })}
          </div>
        )}

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

      {/* Compounds legend */}
      <div
        className="flex items-center gap-2 rounded-lg border p-3"
        style={{ backgroundColor: "var(--surface2)", borderColor: "hsl(var(--border-subtle))" }}
      >
        <span className="font-mono text-[10px] font-semibold" style={{ color: "hsl(var(--muted))" }}>
          COMPOUNDS:
        </span>
        <div className="flex gap-2">
          {(["soft", "medium", "hard", "inter", "wet"] as Compound[]).map((compound) => {
            const isUsed = r.frame?.usedCompounds?.includes(compound) ?? false;
            return (
              <div
                key={compound}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px]"
                style={{
                  opacity: isUsed ? 1 : 0.1,
                  backgroundColor: "var(--surface)",
                  transition: "opacity 0.3s",
                }}
              >
                <CompoundDot compound={compound} />
                <span style={{ color: "hsl(var(--text-dim))", textTransform: "uppercase" }}>
                  {compound}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tower */}
      <div ref={towerRef}>
        <GenericTable<ReplayPosition>
          className="data-grid w-full min-w-xl font-mono text-xs md:min-w-3xl"
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

        <div className="min-w-30 flex-1">
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
