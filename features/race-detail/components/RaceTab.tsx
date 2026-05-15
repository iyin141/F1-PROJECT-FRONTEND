'use client';

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Panel } from "@/components/Panel";
import { FlagImage } from "@/_Components/ui/FlagImage";
import { teamColor } from "@/components/DriverCode";
import { GenericTable, type ColumnDef } from "@/components/ui/GenericTable";
import { NotAvailable } from "@/features/race-detail/components/NotAvailable";
import type { RaceTabProps } from "@/features/race-detail/components/tab-types";
import type { RaceResult } from "@/types/ui";
import { getDriverFlagUrl } from "@/Lib/nationality";
import { PodiumBlock } from "@/components/PodiumBlock";
import { Skeleton } from "@/components/Skeleton";
import type { CSSProperties } from "react";
import { useRaceResults } from "@/features/race-detail/hooks/useRaceDetail";

const INITIAL_COUNT = 10;

const isRetired = (position: RaceResult["position"]) => typeof position !== "number";

const columns: ColumnDef<RaceResult>[] = [
  {
    key: "pos",
    width: "56px",
    header: "POS",
    render: (r) => {
      const retired = isRetired(r.position);
      const gridDelta = typeof r.position === "number" ? r.startGrid - r.position : 0;

      return (
        <div className="flex items-center gap-1.5">
          <span
            className="w-6 text-right font-mono text-sm tabular-nums"
            style={{ color: retired ? "hsl(var(--muted))" : "hsl(var(--text))" }}
          >
            {r.position}
          </span>
          {!retired && gridDelta > 0 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="9" height="9" viewBox="0 0 24 24"
              fill="none" stroke="hsl(var(--green))"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          )}
          {!retired && gridDelta < 0 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="9" height="9" viewBox="0 0 24 24"
              fill="none" stroke="hsl(var(--red))"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          )}
          {!retired && gridDelta === 0 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="9" height="9" viewBox="0 0 24 24"
              fill="none" stroke="hsl(var(--muted-2))"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M5 12h14" />
            </svg>
          )}
        </div>
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
        <Link
          href={`/drivers/${r.driver.code}`}
          className="font-mono text-sm font-semibold tracking-wider transition-colors hover:text-blue"
          style={{ color: "hsl(var(--text))" }}
        >
          {r.driver.code}
        </Link>
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
      <span
        className="font-mono text-xs tabular-nums"
        style={{ color: "hsl(var(--text-dim))" }}
      >
        {r.laps}
      </span>
    ),
  },
  {
    key: "gap",
    width: "110px",
    header: "TIME / GAP",
    render: (r) => (
      <span
        className="font-mono text-xs tabular-nums"
        style={{ color: "hsl(var(--text-dim))" }}
      >
        {r.gap ?? r.time ?? "–"}
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
  {
    key: "fl",
    width: "32px",
    align: "center",
    render: (r) =>
      r.fastestLap ? (
        <span
          className="rounded-sm px-1 py-0.5 font-mono text-[9px] font-bold tracking-widest"
          style={{
            color: "var(--purple)",
            backgroundColor: "color-mix(in srgb, var(--purple) 18%, transparent)",
          }}
        >
          FL
        </span>
      ) : null,
  },
];

export const RaceTab = ({ year, round, upcoming }: RaceTabProps) => {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: resultsData, isLoading, isFetching } = useRaceResults(year, round);
  const loading = isLoading || (isFetching && !resultsData);
  const results = { data: resultsData, loading };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    if (expanded) {
      el.style.maxHeight = `${el.scrollHeight}px`;
      return;
    }

    // Animate collapse: set to current height first, then shrink
    el.style.maxHeight = `${el.scrollHeight}px`;
    requestAnimationFrame(() => {
      el.style.maxHeight = `${INITIAL_COUNT * 48}px`;
    });
  }, [expanded, resultsData]);

  if (upcoming) return <NotAvailable />;

  if (loading) {
    return (
      <Panel label="RACE CLASSIFICATION">
        <div className="space-y-4">
          <div className="panel-scroll w-full">
            <div className="space-y-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-2">
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    );
  }

  const sorted = [...(results.data ?? [])].sort((a, b) => {
    const av = isRetired(a.position) ? 999 : a.position;
    const bv = isRetired(b.position) ? 999 : b.position;
    return av - bv;
  });

  // top 3 go to the podium, the rest into the table
  const podiumResults = sorted.filter(
    (r) => r.position === 1 || r.position === 2 || r.position === 3,
  );
  const tableResults = sorted.filter(
    (r) => r.position !== 1 && r.position !== 2 && r.position !== 3,
  );

  const hasMore = tableResults.length > INITIAL_COUNT;

  return (
    <Panel label="RACE CLASSIFICATION">
      {(
        <div className="space-y-4">
          {/* ── Podium top 3 ── */}
          {podiumResults.length === 3 && (
            <PodiumBlock
              results={podiumResults}
              renderStats={(r, isWinner) => (
                <>
                  <span
                    className="tabular-nums"
                    style={{ color: "hsl(var(--text-dim))" }}
                  >
                    {isWinner ? r.time ?? "—" : r.gap ?? "+—"}
                  </span>
                  <span style={{ color: "hsl(var(--muted))" }}>
                    {r.laps} LAPS
                  </span>
                  <div className="flex items-center gap-2">
                    {r.points > 0 && (
                      <span
                        className="font-bold tabular-nums"
                        style={{ color: "hsl(var(--amber))" }}
                      >
                        {r.points} PTS
                      </span>
                    )}
                    {r.fastestLap && (
                      <span
                        className="rounded-sm px-1 py-0.5 text-[9px] font-bold tracking-widest"
                        style={{
                          color: "var(--purple)",
                          backgroundColor: "color-mix(in srgb, var(--purple) 18%, transparent)",
                        }}
                      >
                        FL
                      </span>
                    )}
                  </div>
                </>
              )}
            />
          )}

          {/* ── Positions 4+ ── */}
          <div className="panel-scroll w-full">
            <div
              ref={listRef}
              className="overflow-hidden"
              style={{
                maxHeight: `${INITIAL_COUNT * 48}px`,
                transition: "max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <GenericTable<RaceResult>
                className="data-grid w-full min-w-xl font-mono text-xs md:min-w-2xl"
                columns={columns}
                data={tableResults}
                getRowKey={(r) => r.driver.id}
                getRowStyle={(r, idx) => {
                  const style: CSSProperties = {
                    opacity:
                      !expanded && idx >= INITIAL_COUNT
                        ? 0
                        : isRetired(r.position)
                        ? 0.45
                        : 1,
                    transitionDelay:
                      expanded && idx >= INITIAL_COUNT
                        ? `${(idx - INITIAL_COUNT) * 30}ms`
                        : "0ms",
                  };
                  if (r.fastestLap) {
                    style.backgroundColor =
                      "color-mix(in srgb, var(--purple) 7%, transparent)";
                  }
                  return style;
                }}
                getRowClassName={() => "transition-all duration-300"}
              />
            </div>

            {hasMore && (
              <button
                onClick={() => setExpanded((prev) => !prev)}
                className="flex w-full items-center justify-center gap-2 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
                style={{
                  color: "hsl(var(--muted))",
                  borderTop: "1px solid hsl(var(--border-subtle))",
                  backgroundColor: "var(--surface2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "hsl(var(--text-dim))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "hsl(var(--muted))";
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{
                    transition: "transform 0.3s ease",
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
                {expanded ? "Show Less" : `Show All ${tableResults.length} Drivers`}
              </button>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
};
