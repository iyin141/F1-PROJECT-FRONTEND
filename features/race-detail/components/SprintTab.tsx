'use client';

import { useState, useTransition } from "react";
import { cn } from "@/Lib/utils";
import { Panel } from "@/components/Panel";
import { teamColor } from "@/components/DriverCode";
import { GenericTable, type ColumnDef } from "@/components/ui/GenericTable";
import { NotAvailable } from "@/features/race-detail/components/NotAvailable";
import type { RaceTabProps } from "@/features/race-detail/components/tab-types";
import type { QualifyingResult, RaceResult } from "@/types/ui";
import { getDriverFlagUrl } from "@/Lib/nationality";
import { FlagImage } from "@/_Components/ui/FlagImage";
import { PodiumBlock } from "@/components/PodiumBlock";
import { useSprintResults, useSprintShootoutResults } from "@/features/race-detail/hooks/useRaceDetail";

// ---------------------------------------------------------------------------
// Sprint Shootout (qualifying-style) columns
// ---------------------------------------------------------------------------

const bestSegment = (r: QualifyingResult): "Q1" | "Q2" | "Q3" =>
  r.q3 != null ? "Q3" : r.q2 != null ? "Q2" : "Q1";

const shootoutColumns: ColumnDef<QualifyingResult>[] = [
  {
    key: "pos",
    width: "40px",
    header: "POS",
    render: (r) => (
      <span
        className="font-mono text-sm tabular-nums font-semibold"
        style={{ color: r.position === 1 ? "hsl(var(--amber))" : "hsl(var(--text))" }}
      >
        {r.position}
      </span>
    ),
  },
  {
    key: "strip",
    width: "3px",
    render: (r) => (
      <span
        aria-hidden
        className="inline-block h-7 w-0.75 rounded-sm"
        style={{ backgroundColor: teamColor(r.driver.team) }}
      />
    ),
  },
  {
    key: "flag",
    width: "32px",
    align: "center",
    render: (r) => {
      const flag = getDriverFlagUrl(r.driver.code, 40);
      return flag ? <FlagImage src={flag} /> : null;
    },
  },
  {
    key: "driver",
    width: "1fr",
    header: "DRIVER",
    render: (r) => (
      <div className="flex min-w-0 items-center gap-2">
        <div className="min-w-0">
          <div
            className="font-mono text-sm font-semibold tracking-wider"
            style={{ color: "hsl(var(--text))" }}
          >
            {r.driver.code}
          </div>
          <div
            className="truncate font-mono text-[10px] uppercase tracking-[0.15em]"
            style={{ color: "hsl(var(--muted))" }}
          >
            {r.driver.firstName} {r.driver.lastName}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "sq1",
    width: "90px",
    header: "SQ1",
    align: "right",
    render: (r) => {
      const best = bestSegment(r) === "Q1";
      return (
        <span
          className={cn("font-mono text-xs tabular-nums", best && "font-bold")}
          style={{
            color: best ? "var(--purple)" : r.q1 ? "hsl(var(--text-dim))" : "hsl(var(--muted))",
          }}
        >
          {r.q1 ?? "—"}
        </span>
      );
    },
  },
  {
    key: "sq2",
    width: "90px",
    header: "SQ2",
    align: "right",
    render: (r) => {
      const best = bestSegment(r) === "Q2";
      return (
        <span
          className={cn("font-mono text-xs tabular-nums", best && "font-bold")}
          style={{
            color: best ? "var(--purple)" : r.q2 ? "hsl(var(--text-dim))" : "hsl(var(--muted))",
          }}
        >
          {r.q2 ?? "—"}
        </span>
      );
    },
  },
  {
    key: "sq3",
    width: "90px",
    header: "SQ3",
    align: "right",
    render: (r) => {
      const isPoleman = r.position === 1;
      const best = bestSegment(r) === "Q3";
      return (
        <span
          className={cn("font-mono text-xs tabular-nums", (isPoleman || best) && "font-bold")}
          style={{
            color: isPoleman
              ? "hsl(var(--amber))"
              : best
              ? "var(--purple)"
              : r.q3
              ? "hsl(var(--text-dim))"
              : "hsl(var(--muted))",
          }}
        >
          {r.q3 ?? "—"}
        </span>
      );
    },
  },
];

// ---------------------------------------------------------------------------
// Sprint Race columns
// ---------------------------------------------------------------------------

const isRetired = (position: RaceResult["position"]) => typeof position !== "number";

const sprintRaceColumns: ColumnDef<RaceResult>[] = [
  {
    key: "pos",
    width: "56px",
    header: "POS",
    render: (r) => {
      const retired = isRetired(r.position);
      return (
        <span
          className="font-mono text-sm tabular-nums font-semibold"
          style={{ color: retired ? "hsl(var(--muted))" : "hsl(var(--text))" }}
        >
          {r.position}
        </span>
      );
    },
  },
  {
    key: "strip",
    width: "3px",
    render: (r) => (
      <span
        aria-hidden
        className="inline-block h-7 w-0.75 rounded-sm"
        style={{ backgroundColor: teamColor(r.driver.team) }}
      />
    ),
  },
  {
    key: "flag",
    width: "32px",
    align: "center",
    render: (r) => {
      const flag = getDriverFlagUrl(r.driver.code, 40);
      return flag ? <FlagImage src={flag} /> : null;
    },
  },
  {
    key: "driver",
    width: "1fr",
    header: "DRIVER",
    render: (r) => (
      <div className="min-w-0">
        <div
          className="font-mono text-sm font-semibold tracking-wider"
          style={{ color: "hsl(var(--text))" }}
        >
          {r.driver.code}
        </div>
        <div
          className="truncate font-mono text-[10px] uppercase tracking-[0.15em]"
          style={{ color: "hsl(var(--muted))" }}
        >
          {r.driver.firstName} {r.driver.lastName}
        </div>
      </div>
    ),
  },
  {
    key: "laps",
    width: "48px",
    header: "LAPS",
    render: (r) => (
      <span className="font-mono text-xs tabular-nums" style={{ color: "hsl(var(--text-dim))" }}>
        {r.laps}
      </span>
    ),
  },
  {
    key: "pts",
    width: "44px",
    header: "PTS",
    align: "right",
    render: (r) => (
      <span
        className="font-mono text-sm tabular-nums font-semibold"
        style={{ color: r.points > 0 ? "hsl(var(--amber))" : "hsl(var(--muted))" }}
      >
        {r.points}
      </span>
    ),
  },
];

// ---------------------------------------------------------------------------
// Sprint Tab Component
// ---------------------------------------------------------------------------

export const SprintTab = ({ year, round, upcoming }: RaceTabProps) => {
  const [view, setView] = useState<"shootout" | "race">("race");
  const [isPending, startTransition] = useTransition();
  const { data: shootoutResults } = useSprintShootoutResults(year, round, !upcoming);
  const { data: sprintResults } = useSprintResults(year, round, !upcoming);

  if (upcoming) return <NotAvailable />;

  return (
    <Panel
      label={`SPRINT · ${view === "shootout" ? "SHOOTOUT" : "RACE"}`}
      action={
        <div className={`flex gap-1 ${isPending ? "pointer-events-none opacity-70" : ""}`}>
          {(["race", "shootout"] as const).map((v) => (
            <button
              key={v}
              onClick={() => startTransition(() => setView(v))}
              className={`rounded-sm px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
                view === v ? "bg-red text-white" : "text-text-dim hover:text-text"
              }`}
            >
              {v === "shootout" ? "Shootout" : "Sprint Race"}
            </button>
          ))}
        </div>
      }
    >
      {view === "shootout" ? (
        /* ── Sprint Shootout ── */
        !shootoutResults?.length ? (
          <NotAvailable />
        ) : (
          <div className="space-y-4">
            {shootoutResults.filter((r) => r.position <= 3).length === 3 && (
              <PodiumBlock
                results={shootoutResults.filter((r) => r.position <= 3)}
                label="SPRINT POLE & TOP 3"
                renderStats={(r, isWinner) => {
                  const best = bestSegment(r);
                  const time = best === "Q3" ? r.q3 : best === "Q2" ? r.q2 : r.q1;
                  return (
                    <>
                      <span
                        className="tabular-nums font-bold"
                        style={{ color: isWinner ? "hsl(var(--amber))" : "var(--purple)" }}
                      >
                        {time ?? "—"}
                      </span>
                      <span style={{ color: "hsl(var(--muted))" }}>S{best.slice(1)}</span>
                    </>
                  );
                }}
              />
            )}
            <div className="panel-scroll w-full">
              <GenericTable<QualifyingResult>
                className="data-grid w-full min-w-xl font-mono text-xs md:min-w-2xl"
                columns={shootoutColumns}
                data={shootoutResults.filter((r) => r.position > 3)}
                getRowKey={(r) => r.driver.id}
              />
            </div>
          </div>
        )
      ) : (
        /* ── Sprint Race ── */
        !sprintResults?.length ? (
          <NotAvailable />
        ) : (
          <div className="space-y-4">
            {sprintResults.filter((r) => typeof r.position === "number" && r.position <= 3).length === 3 && (
              <PodiumBlock
                results={sprintResults.filter((r) => typeof r.position === "number" && r.position <= 3)}
                label="SPRINT TOP 3"
                renderStats={(r, isWinner) => (
                  <>
                    <span className="tabular-nums" style={{ color: "hsl(var(--text-dim))" }}>
                      {isWinner ? r.time ?? "—" : r.gap ?? "+—"}
                    </span>
                    <span style={{ color: "hsl(var(--muted))" }}>{r.laps} LAPS</span>
                    {r.points > 0 && (
                      <span className="font-bold tabular-nums" style={{ color: "hsl(var(--amber))" }}>
                        {r.points} PTS
                      </span>
                    )}
                  </>
                )}
              />
            )}
            <div className="panel-scroll w-full">
              <GenericTable<RaceResult>
                className="data-grid w-full min-w-xl font-mono text-xs md:min-w-2xl"
                columns={sprintRaceColumns}
                data={sprintResults.filter((r) => typeof r.position !== "number" || r.position > 3)}
                getRowKey={(r) => r.driver.id}
                striped
              />
            </div>
          </div>
        )
      )}
    </Panel>
  );
};
