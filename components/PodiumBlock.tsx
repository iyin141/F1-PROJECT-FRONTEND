"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { teamColor } from "@/components/DriverCode";
import { getDriverFlagUrl } from "@/Lib/nationality";
import { FlagImage } from "@/_Components/ui/FlagImage";
import type { PodiumEntry, PodiumBlockProps } from "@/types/ui";

export type { PodiumEntry, PodiumBlockProps };

const STEP_CONFIG: Record<1 | 2 | 3, { height: string }> = {
  1: { height: "112px" },
  2: { height: "76px" },
  3: { height: "52px" },
};

function PodiumStep<T extends PodiumEntry>({
  result,
  renderStats,
}: {
  result: T;
  renderStats?: (result: T, isWinner: boolean, accent: string) => ReactNode;
}) {
  const pos = result.position as 1 | 2 | 3;
  const { height } = STEP_CONFIG[pos];
  const flag = getDriverFlagUrl(result.driver.code, 40);
  const accent = teamColor(result.driver.team);
  const isWinner = pos === 1;

  return (
    <div
      className="flex min-w-0 flex-1 flex-col items-center"
      data-podium-step
    >
      <div className="flex flex-col items-center gap-1 pb-2">
        {flag && <FlagImage src={flag} />}
        <span
          className="font-mono text-[13px] font-bold tracking-[0.12em]"
          style={{ color: isWinner ? "hsl(var(--amber))" : "hsl(var(--text))" }}
        >
          {result.driver.code}
        </span>
        <span
          className="max-w-[100px] truncate text-center font-mono text-[10px] uppercase tracking-[0.1em]"
          style={{ color: "hsl(var(--muted))" }}
        >
          {result.driver.firstName} {result.driver.lastName}
        </span>
      </div>

      <div
        className="flex w-full items-center justify-center border-t-2 font-display text-3xl font-semibold"
        style={{
          height,
          borderTopColor: isWinner ? "hsl(var(--red))" : accent,
          backgroundColor: isWinner
            ? "color-mix(in srgb, hsl(var(--red)) 8%, var(--surface2))"
            : "var(--surface2)",
          color: isWinner ? "hsl(var(--red))" : "hsl(var(--text))",
        }}
      >
        P{pos}
      </div>

      <div
        className="flex w-full flex-col items-center gap-1 px-2 py-2.5 font-mono text-[10px]"
        style={{
          backgroundColor: "var(--surface)",
          borderBottom: `1px solid ${accent}`,
          minHeight: "56px",
        }}
      >
        <span className="h-[2px] w-8" style={{ background: accent }} />
        {renderStats?.(result, isWinner, accent)}
      </div>
    </div>
  );
}

export function PodiumBlock<T extends PodiumEntry>({
  results,
  renderStats,
  label = "PODIUM",
}: PodiumBlockProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const steps = ref.current.querySelectorAll("[data-podium-step]");
    gsap.fromTo(
      steps,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.12 },
    );
  }, [results]);

  const p1 = results.find((r) => r.position === 1);
  const p2 = results.find((r) => r.position === 2);
  const p3 = results.find((r) => r.position === 3);

  if (!p1 || !p2 || !p3) return null;

  const divider = (
    <div
      className="self-stretch w-px"
      style={{ backgroundColor: "hsl(var(--border-subtle))" }}
    />
  );

  return (
    <div ref={ref} className="w-full overflow-hidden border border-border-subtle">
      <div
        className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{
          color: "hsl(var(--muted))",
          backgroundColor: "var(--surface2)",
          borderBottom: "1px solid hsl(var(--border-subtle))",
        }}
      >
        {label}
      </div>

      <div className="flex items-end">
        <PodiumStep result={p2} renderStats={renderStats} />
        {divider}
        <PodiumStep result={p1} renderStats={renderStats} />
        {divider}
        <PodiumStep result={p3} renderStats={renderStats} />
      </div>
    </div>
  );
}
