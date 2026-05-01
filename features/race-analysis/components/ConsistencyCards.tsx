'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Skeleton } from "@/components/Skeleton";
import { teamColor } from "@/components/DriverCode";
import { CompoundDot } from "@/components/CompoundDot";
import { formatLapMs } from "@/Lib/format";
import type { ConsistencyScore } from "@/types/ui";

export const ConsistencyCards = ({ year, round }: { year: number; round: number }) => {
  const scores: { data: ConsistencyScore[] | undefined; loading: boolean } = { data: undefined, loading: false };
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scores.data || !containerRef.current) return;
    const counters = containerRef.current.querySelectorAll<HTMLElement>("[data-counter]");
    counters.forEach((el) => {
      const target = Number(el.dataset.counter ?? 0);
      const proxy = { v: 0 };
      gsap.to(proxy, {
        v: target,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = proxy.v.toFixed(1);
        },
      });
    });
  }, [scores.data]);

  if (scores.loading) return <Skeleton className="h-[24rem]" />;

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-5"
      style={{ backgroundColor: "hsl(var(--border-subtle))" }}
    >
      {scores.data?.map((s) => (
        <div
          key={s.driver.id}
          className="flex flex-col gap-2.5 p-3"
          style={{ backgroundColor: "var(--surface)" }}
        >
          {/* Driver identity */}
          <div className="flex items-center gap-1.5">
            <span
              className="h-3 w-[3px] shrink-0 rounded-sm"
              style={{ background: teamColor(s.driver.team) }}
            />
            <span
              className="font-mono text-[12px] font-bold tracking-[0.06em]"
              style={{ color: "hsl(var(--text))" }}
            >
              {s.driver.code}
            </span>
          </div>

          {/* Score with animated counter */}
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

          {/* Score bar */}
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

          {/* Stats */}
          <dl
            className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 font-mono text-[9px] uppercase tracking-[0.16em]"
          >
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
};
