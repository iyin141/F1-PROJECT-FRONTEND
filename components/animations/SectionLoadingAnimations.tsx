'use client';

import { useEffect } from "react";
import type { ReactNode } from "react";
import Skeleton from "./Skeleton";

type ShellProps = {
  title: string;
  className?: string;
  children?: ReactNode;
};

function LoadingShell({ title, className, children }: ShellProps) {
  useEffect(() => {
    console.log(`[section-loading] mount ${title}`);
    return () => console.log(`[section-loading] unmount ${title}`);
  }, [title]);

  return (
    <section className={`section-loading ${className ?? ""}`} aria-live="polite" aria-label={title}>
      <div className="section-loading__label">{title}</div>
      {children ?? null}
    </section>
  );
}

export function RaceResultsAnimation() {
  return (
    <LoadingShell title="Loading race results" className="race-results-loading">
      <div className="grid-slots">
        <Skeleton height={36} />
        <Skeleton height={36} />
        <Skeleton height={36} />
        <Skeleton height={36} />
      </div>
    </LoadingShell>
  );
}

export function QualifyingAnimation() {
  return (
    <LoadingShell title="Loading qualifying" className="qualifying-loading">
      <div className="grid-slots">
        <Skeleton height={28} />
        <Skeleton height={28} />
        <Skeleton height={28} />
        <Skeleton height={28} />
      </div>
    </LoadingShell>
  );
}

export function StandingsAnimation() {
  return (
    <LoadingShell title="Loading standings" className="standings-loading">
      <div className="points-bars">
        <Skeleton height={12} style={{ width: "90%" }} />
        <Skeleton height={12} style={{ width: "70%" }} />
        <Skeleton height={12} style={{ width: "55%" }} />
        <Skeleton height={12} style={{ width: "40%" }} />
      </div>
    </LoadingShell>
  );
}

export function LapAnalysisAnimation() {
  return (
    <LoadingShell title="Loading lap analysis" className="lap-analysis-loading">
      <div className="trace-svg">
        <svg className="trace-svg" viewBox="0 0 240 40" preserveAspectRatio="none">
          <rect width="100%" height="100%" fill="none" />
          <g>
            <rect x="0" y="10" width="100%" height="6" className="skeleton" />
          </g>
        </svg>
      </div>
    </LoadingShell>
  );
}

export function TelemetryAnimation() {
  return (
    <LoadingShell title="Loading telemetry" className="telemetry-loading">
      <div className="telemetry-lines">
        <Skeleton height={8} />
        <Skeleton height={8} />
        <Skeleton height={8} />
      </div>
    </LoadingShell>
  );
}

export function ScheduleAnimation() {
  return (
    <LoadingShell title="Loading schedule" className="schedule-loading">
      <div className="grid-slots">
        <Skeleton height={18} />
        <Skeleton height={18} />
        <Skeleton height={18} />
        <Skeleton height={18} />
      </div>
    </LoadingShell>
  );
}

export function DriverAnimation() {
  return (
    <LoadingShell title="Loading driver profile" className="driver-loading">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Skeleton variant="circle" width={56} height={56} />
        <div style={{ flex: 1 }}>
          <Skeleton height={14} style={{ width: "70%" }} />
          <div style={{ height: 8 }} />
          <Skeleton height={12} style={{ width: "40%" }} />
        </div>
      </div>
    </LoadingShell>
  );
}
