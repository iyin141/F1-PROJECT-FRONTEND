'use client';

import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { teamColor } from "@/components/DriverCode";
import { CompoundDot } from "@/components/CompoundDot";
import { formatLapMs } from "@/Lib/format";
import { useConsistencyByStint } from "@/features/race-analysis/hooks/useRaceAnalysis";
import type { ConsistencyScore } from "@/types/ui";

// ---------------------------------------------------------------------------
// Shared card grid
// ---------------------------------------------------------------------------

function ConsistencyCardGrid({ scores }: { scores: ConsistencyScore[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scores.length || !containerRef.current) return;
    const counters = containerRef.current.querySelectorAll<HTMLElement>("[data-counter]");
    counters.forEach((el) => {
      const target = Number(el.dataset.counter ?? 0);
      const proxy = { v: 0 };
      gsap.to(proxy, {
        v: target,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => { el.textContent = proxy.v.toFixed(1); },
      });
    });
  }, [scores]);

  if (scores.length === 0) {
    return (
      <div
        className="flex h-24 items-center justify-center font-mono text-[10px] uppercase tracking-[0.18em]"
        style={{ color: "hsl(var(--muted-2))" }}
      >
        Too few laps for this stint
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-5"
      style={{ backgroundColor: "hsl(var(--border-subtle))" }}
    >
      {scores.map((s) => (
        <div
          key={s.driver.id}
          className="flex flex-col gap-2.5 p-3"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="h-3 w-0.75 shrink-0 rounded-sm"
              style={{ background: teamColor(s.driver.team) }}
            />
            <span
              className="font-mono text-[12px] font-bold tracking-[0.06em]"
              style={{ color: "hsl(var(--text))" }}
            >
              {s.driver.code}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span
              data-counter={s.score}
              className="font-display text-2xl font-semibold tabular-nums"
              style={{ color: "hsl(var(--text))" }}
            >
              0.0
            </span>
            <span
              className="font-mono text-[9px] uppercase tracking-[0.18em]"
              style={{ color: "hsl(var(--muted))" }}
            >
              SCORE
            </span>
          </div>

          <div
            className="h-1 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "var(--surface2)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, s.score)}%`,
                backgroundColor: "hsl(var(--red))",
              }}
            />
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 font-mono text-[9px] uppercase tracking-[0.16em]">
            <dt style={{ color: "hsl(var(--muted))" }}>BEST</dt>
            <dd
              className="text-right normal-case tracking-normal tabular-nums"
              style={{ color: "hsl(var(--text-dim))" }}
            >
              {formatLapMs(s.bestLapMs)}
            </dd>
            <dt style={{ color: "hsl(var(--muted))" }}>AVG</dt>
            <dd
              className="text-right normal-case tracking-normal tabular-nums"
              style={{ color: "hsl(var(--text-dim))" }}
            >
              {formatLapMs(s.avgLapMs)}
            </dd>
            <dt style={{ color: "hsl(var(--muted))" }}>TYRE</dt>
            <dd className="flex justify-end">
              <CompoundDot compound={s.topCompound} />
            </dd>
          </dl>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export const ConsistencyCards = ({ year, round }: { year: number; round: number }) => {
  const { data: byStint, isLoading } = useConsistencyByStint(year, round);

  const stintKeys = useMemo(() => {
    if (!byStint) return [];
    return Array.from(byStint.keys())
      .filter((k): k is number => k !== "overall")
      .sort((a, b) => a - b);
  }, [byStint]);

  type TabKey = "overall" | number;
  const [activeTab, setActiveTab] = useState<TabKey>("overall");

  const activeScores = byStint?.get(activeTab) ?? [];

  if (isLoading) return null;

  const tabs: TabKey[] = ["overall", ...stintKeys];

  return (
    <div>
      {/* Sub-tab selector */}
      {tabs.length > 1 && (
        <div
          className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-4 py-2.5"
          style={{ backgroundColor: "var(--surface2)" }}
        >
          {tabs.map((tab) => {
            const active = tab === activeTab;
            const label = tab === "overall" ? "OVERALL" : `STINT ${tab}`;
            return (
              <button
                key={String(tab)}
                onClick={() => setActiveTab(tab)}
                className="border border-border-subtle px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors"
                style={{
                  backgroundColor: active ? "hsl(var(--red))" : "transparent",
                  color: active ? "hsl(var(--text))" : "hsl(var(--muted))",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <ConsistencyCardGrid scores={activeScores} />
    </div>
  );
};
