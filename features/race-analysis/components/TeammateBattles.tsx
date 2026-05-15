'use client';

// (no direct React imports required in this file)
import { teamColor } from "@/components/DriverCode";
import { formatLapMs } from "@/Lib/format";
import { useTeammateBattles } from "@/features/race-analysis/hooks/useRaceAnalysis";
import Skeleton from "@/components/animations/Skeleton";
import type { TeammateBattle, PhaseBattle, RacePhase } from "@/types/ui";
import type { AnalysisDriverOption } from "./DriverSelect";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PHASE_LABELS: Record<RacePhase, string> = {
  early: "EARLY",
  mid: "MID",
  late: "LATE",
};

function WinnerBadge({ code, teamId }: { code: string; teamId: string }) {
  return (
    <span
      className="rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest"
      style={{
        borderColor: teamColor(teamId as Parameters<typeof teamColor>[0]),
        color: teamColor(teamId as Parameters<typeof teamColor>[0]),
      }}
    >
      {code}
    </span>
  );
}

function PhaseCell({
  battle,
  phase,
  driverACode,
  driverBCode,
  teamId,
}: {
  battle: PhaseBattle;
  phase: RacePhase;
  driverACode: string;
  driverBCode: string;
  teamId: string;
}) {
  const noData = battle.aAvgMs === null && battle.bAvgMs === null;

  return (
    <div className="flex flex-col gap-1 px-3 py-2.5">
      <span
        className="font-mono text-[9px] uppercase tracking-[0.2em]"
        style={{ color: "hsl(var(--muted))" }}
      >
        {PHASE_LABELS[phase]} · L{battle.lapFrom}–{battle.lapTo}
      </span>

      {noData ? (
        <span
          className="font-mono text-[9px]"
          style={{ color: "hsl(var(--muted-2))" }}
        >
          —
        </span>
      ) : (
        <div className="flex items-center gap-2">
          {/* Driver A */}
          <div className="flex flex-col items-center gap-0.5">
            <span
              className="font-mono text-[10px] font-semibold tracking-[0.06em]"
              style={{
                color:
                  battle.winner === driverACode
                    ? teamColor(teamId as Parameters<typeof teamColor>[0])
                    : "hsl(var(--muted))",
              }}
            >
              {driverACode}
            </span>
            <span
              className="font-mono text-[9px] tabular-nums"
              style={{ color: "hsl(var(--text-dim))" }}
            >
              {battle.aAvgMs !== null ? formatLapMs(battle.aAvgMs) : "—"}
            </span>
          </div>

          <span
            className="font-mono text-[9px]"
            style={{ color: "hsl(var(--muted-2))" }}
          >
            vs
          </span>

          {/* Driver B */}
          <div className="flex flex-col items-center gap-0.5">
            <span
              className="font-mono text-[10px] font-semibold tracking-[0.06em]"
              style={{
                color:
                  battle.winner === driverBCode
                    ? teamColor(teamId as Parameters<typeof teamColor>[0])
                    : "hsl(var(--muted))",
              }}
            >
              {driverBCode}
            </span>
            <span
              className="font-mono text-[9px] tabular-nums"
              style={{ color: "hsl(var(--text-dim))" }}
            >
              {battle.bAvgMs !== null ? formatLapMs(battle.bAvgMs) : "—"}
            </span>
          </div>

          {battle.winner && battle.deltaMs !== null && (
            <span
              className="ml-auto font-mono text-[9px] tabular-nums"
              style={{ color: "hsl(var(--muted))" }}
            >
              +{battle.deltaMs.toFixed(0)}ms
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function BattleCard({ battle }: { battle: TeammateBattle }) {
  const color = teamColor(battle.teamId);

  return (
    <div
      className="overflow-hidden border border-border-subtle"
      style={{ backgroundColor: "var(--surface)" }}
    >
      {/* Team header */}
      <div
        className="flex items-center gap-3 border-b border-border-subtle px-4 py-2.5"
        style={{ backgroundColor: "var(--surface2)" }}
      >
        <span
          className="h-3.5 w-1 shrink-0 rounded-sm"
          style={{ background: color }}
        />
        <span
          className="flex-1 font-mono text-[10px] uppercase tracking-[0.22em]"
          style={{ color: "hsl(var(--text-dim))" }}
        >
          {battle.teamId.replace(/-/g, " ")}
        </span>
        {battle.overallWinner && (
          <div className="flex items-center gap-1.5">
            <span
              className="font-mono text-[9px] uppercase tracking-[0.14em]"
              style={{ color: "hsl(var(--muted))" }}
            >
              FASTER:
            </span>
            <WinnerBadge code={battle.overallWinner} teamId={battle.teamId} />
          </div>
        )}
      </div>

      {/* Phase breakdown */}
      <div className="divide-y divide-border-subtle">
        {battle.phases.map((phase) => (
          <PhaseCell
            key={phase.phase}
            battle={phase}
            phase={phase.phase}
            driverACode={battle.driverA.code}
            driverBCode={battle.driverB.code}
            teamId={battle.teamId}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface TeammateBattlesProps {
  year: number;
  round: number;
  drivers: AnalysisDriverOption[];
}

export const TeammateBattles = ({ year, round, drivers }: TeammateBattlesProps) => {
  const { data: battles, isLoading } = useTeammateBattles(year, round);
  void drivers;

  if (isLoading) return <Skeleton height={200} />;
  if (battles.length === 0) {
    return (
      <div
        className="flex h-24 items-center justify-center font-mono text-[10px] uppercase tracking-[0.18em]"
        style={{ color: "hsl(var(--muted-2))" }}
      >
        No teammate data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {battles.map((b) => (
        <BattleCard key={b.teamId} battle={b} />
      ))}
    </div>
  );
};
