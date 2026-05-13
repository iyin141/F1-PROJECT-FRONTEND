'use client';

import { useEffect } from "react";
import type { ReactNode } from "react";

type ShellProps = {
  title: string;
  className?: string;
  children?: ReactNode;
};

function LoadingShell({ title, className, children }: ShellProps) {
  useEffect(() => {
    console.log(`[loading:replaced] mount ${title}`);
    return () => console.log(`[loading:replaced] unmount ${title}`);
  }, [title]);

  return (
    <section className={`loading-replaced ${className ?? ""}`} aria-live="polite" aria-label={title}>
      <div className="loading-replaced__label">{title}</div>
      {children ?? null}
    </section>
  );
}

export function RaceResultsAnimation() {
  return <LoadingShell title="Loading race results" className="race-results-loading" />;
}

export function QualifyingAnimation() {
  return <LoadingShell title="Loading qualifying" className="qualifying-loading" />;
}

export function StandingsAnimation() {
  return <div className="standings-loading-placeholder" aria-hidden />;
}

export function LapAnalysisAnimation() {
  return <LoadingShell title="Loading lap analysis" className="lap-analysis-loading" />;
}

export function TelemetryAnimation() {
  return <LoadingShell title="Loading telemetry" className="telemetry-loading" />;
}

export function ScheduleAnimation() {
  return <LoadingShell title="Loading schedule" className="schedule-loading" />;
}

export function DriverAnimation() {
  return <LoadingShell title="Loading driver profile" className="driver-loading" />;
}
