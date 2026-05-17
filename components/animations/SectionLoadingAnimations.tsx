'use client';

import { useEffect } from "react";
import type { ReactNode } from "react";
import Skeleton from "./Skeleton";
import { TableSkeleton } from "./TableSkeleton";

type ShellProps = {
  title: string;
  className?: string;
  children?: ReactNode;
};

function LoadingShell({ title, className, children }: ShellProps) {
  return (
    <section className={`section-loading ${className ?? ""}`} aria-live="polite" aria-label={title}>
      {children ?? null}
    </section>
  );
}

export function RaceResultsAnimation() {
  return (
    <LoadingShell title="Loading race results" className="race-results-loading">
      <TableSkeleton rows={10} customTexts={["Retrieving final race order...", "Calculating championship points..."]} />
    </LoadingShell>
  );
}

export function QualifyingAnimation() {
  return (
    <LoadingShell title="Loading qualifying" className="qualifying-loading">
      <TableSkeleton rows={10} customTexts={["Fetching Q1/Q2/Q3 split times...", "Determining pole position..."]} />
    </LoadingShell>
  );
}

export function StandingsAnimation() {
  return (
    <LoadingShell title="Loading standings" className="standings-loading">
      <TableSkeleton rows={5} customTexts={["Updating driver points...", "Updating constructor rankings..."]} />
    </LoadingShell>
  );
}

export function ScheduleAnimation() {
  return (
    <LoadingShell title="Loading schedule" className="schedule-loading">
      <TableSkeleton rows={8} customTexts={["Syncing season calendar...", "Checking session start times..."]} />
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
