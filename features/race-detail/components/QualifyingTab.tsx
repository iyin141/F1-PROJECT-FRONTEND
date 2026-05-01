'use client';

import { cn } from "@/Lib/utils";
import { Panel } from "@/components/Panel";
import { Skeleton } from "@/components/Skeleton";
import { teamColor } from "@/components/DriverCode";
import { GenericTable, type ColumnDef } from "@/components/ui/GenericTable";
import { NotAvailable } from "@/features/race-detail/components/NotAvailable";
import type { RaceTabProps } from "@/features/race-detail/components/tab-types";
import type { QualifyingResult } from "@/types/ui";
import { useQualifyingResults } from "@/features/race-detail/hooks/useRaceDetail";
import { adaptQualifyingResults } from "@/Lib/adapters";
import { getDriverFlagUrl } from "@/Lib/nationality";
import { PodiumBlock } from "@/components/PodiumBlock";

// Derive which segment is the driver's "best" (i.e., the latest they competed in)
const bestSegment = (r: QualifyingResult): "Q1" | "Q2" | "Q3" =>
  r.q3 != null ? "Q3" : r.q2 != null ? "Q2" : "Q1";

const columns: ColumnDef<QualifyingResult>[] = [
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
        className="inline-block h-7 w-[3px] rounded-sm"
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
      return flag ? (
        <img
          src={flag}
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
        {r.position === 1 && (
          <span
            className="font-mono text-[9px] font-bold tracking-[0.2em]"
            style={{ color: "hsl(var(--amber))" }}
          >
            POLE
          </span>
        )}
      </div>
    ),
  },
  {
    key: "q1",
    width: "90px",
    header: "Q1",
    align: "right",
    render: (r) => {
      const best = bestSegment(r) === "Q1";
      return (
        <span
          className={cn("font-mono text-xs tabular-nums", best && "font-bold")}
          style={{
            color: best
              ? "var(--purple)"
              : r.q1
              ? "hsl(var(--text-dim))"
              : "hsl(var(--muted))",
          }}
        >
          {r.q1 ?? "—"}
        </span>
      );
    },
  },
  {
    key: "q2",
    width: "90px",
    header: "Q2",
    align: "right",
    render: (r) => {
      const best = bestSegment(r) === "Q2";
      return (
        <span
          className={cn("font-mono text-xs tabular-nums", best && "font-bold")}
          style={{
            color: best
              ? "var(--purple)"
              : r.q2
              ? "hsl(var(--text-dim))"
              : "hsl(var(--muted))",
          }}
        >
          {r.q2 ?? "—"}
        </span>
      );
    },
  },
  {
    key: "q3",
    width: "90px",
    header: "Q3",
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

export const QualifyingTab = ({ year, round, upcoming }: RaceTabProps) => {
  const { data: qData, isLoading } = useQualifyingResults(year, round);
  const q = { data: qData ? adaptQualifyingResults(qData) : undefined, loading: isLoading };
  if (upcoming) return <NotAvailable />;

  const allResults = q.data ?? [];
  const podiumResults = allResults.filter((r) => r.position === 1 || r.position === 2 || r.position === 3);
  const tableResults = allResults.filter((r) => r.position !== 1 && r.position !== 2 && r.position !== 3);

  return (
    <Panel label="QUALIFYING · Q1 / Q2 / Q3">
      {q.loading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="space-y-4">
          {podiumResults.length === 3 && (
            <PodiumBlock
              results={podiumResults}
              label="FRONT ROW & P3"
              renderStats={(r, isWinner) => {
                const best = bestSegment(r);
                const time = best === "Q3" ? r.q3 : best === "Q2" ? r.q2 : r.q1;
                return (
                  <>
                    <span
                      className="tabular-nums font-bold"
                      style={{
                        color: isWinner ? "hsl(var(--amber))" : "var(--purple)",
                      }}
                    >
                      {time ?? "—"}
                    </span>
                    <span style={{ color: "hsl(var(--muted))" }}>
                      {best}
                    </span>
                    {isWinner && (
                      <span
                        className="rounded-sm px-1 py-0.5 text-[9px] font-bold tracking-[0.1em]"
                        style={{
                          color: "hsl(var(--amber))",
                          backgroundColor: "color-mix(in srgb, hsl(var(--amber)) 18%, transparent)",
                        }}
                      >
                        POLE
                      </span>
                    )}
                  </>
                );
              }}
            />
          )}
          <div className="panel-scroll w-full">
          <GenericTable<QualifyingResult>
            className="data-grid w-full min-w-[36rem] font-mono text-xs md:min-w-[42rem]"
            columns={columns}
            data={tableResults}
            getRowKey={(r) => r.driver.id}
            getRowStyle={() => ({ backgroundColor: "transparent" })}
            renderRowFooter={(r) => {
              if (r.position !== 10 && r.position !== 15) return null;
              const label = r.position === 10 ? "Q2 ELIMINATED" : "Q1 ELIMINATED";
              return (
                <div
                  className="px-4 py-1.5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{
                    color: "hsl(var(--red))",
                    backgroundColor: "color-mix(in srgb, hsl(var(--red)) 10%, transparent)",
                    borderBottom: "1px solid color-mix(in srgb, hsl(var(--red)) 30%, transparent)",
                  }}
                >
                  {label}
                </div>
              );
            }}
          />
          </div>
        </div>
      )}
    </Panel>
  );
};
