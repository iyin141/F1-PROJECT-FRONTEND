'use client';

import type { FC } from "react";

// ---------------------------------------------------------------------------
// Shimmer animation is defined once via a style tag injected below.
// It runs left-to-right at 1.5s loop, using rgba steps that work on dark bg.
// ---------------------------------------------------------------------------

const SHIMMER_STYLE = `
@keyframes f1-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.f1-skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.03) 25%,
    rgba(255,255,255,0.07) 50%,
    rgba(255,255,255,0.03) 75%
  );
  background-size: 800px 100%;
  animation: f1-shimmer 1.5s infinite linear;
}
`;

function SkeletonBar({ height, className = "" }: { height: number; className?: string }) {
  return (
    <div
      className={`f1-skeleton ${className}`}
      style={{ height, width: "100%" }}
      aria-hidden
    />
  );
}

// ---------------------------------------------------------------------------
// Variant shapes
// ---------------------------------------------------------------------------

function ChartTall() {
  return <SkeletonBar height={280} />;
}

function ChartShort() {
  return <SkeletonBar height={160} />;
}

function TelemetryVariant() {
  // Matches the 5 channel heights: speed 80, throttle 48, brake 32, gear 40, drs 24
  const channels = [
    { label: "SPEED", height: 80 },
    { label: "THROTTLE", height: 48 },
    { label: "BRAKE", height: 32 },
    { label: "GEAR", height: 40 },
    { label: "DRS", height: 24 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {channels.map((ch) => (
        <div
          key={ch.label}
          style={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <span
            style={{
              width: 56,
              flexShrink: 0,
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 9,
              color: "rgba(255,255,255,0.35)",
              paddingLeft: 4,
            }}
          >
            {ch.label}
          </span>
          <div style={{ flex: 1 }}>
            <SkeletonBar height={ch.height} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableRowsVariant({ rows = 8 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBar key={i} height={32} />
      ))}
    </div>
  );
}

function GanttVariant() {
  // Represents the TyreStrategy Gantt: ~10 driver rows of 28px each
  const rowCount = 10;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {Array.from({ length: rowCount }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Driver code label placeholder */}
          <div
            className="f1-skeleton"
            style={{ width: 40, height: 12, flexShrink: 0 }}
            aria-hidden
          />
          {/* Stint bar placeholder — varied widths to feel organic */}
          <div
            className="f1-skeleton"
            style={{ height: 28, flex: 1, opacity: 0.7 + (i % 3) * 0.1 }}
            aria-hidden
          />
        </div>
      ))}
    </div>
  );
}

function StatStripVariant() {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ flex: 1 }}>
          <SkeletonBar height={52} />
        </div>
      ))}
    </div>
  );
}

function DriverHeroVariant() {
  return <SkeletonBar height={72} />;
}

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------

export type LoadingVariant =
  | "chart-tall"
  | "chart-short"
  | "telemetry"
  | "table-rows"
  | "gantt"
  | "stat-strip"
  | "driver-hero"
  | "default";

interface F1LoadingStateProps {
  variant?: LoadingVariant;
  message?: string;
  /** Only used for variant="table-rows" */
  rows?: number;
}

export const F1LoadingState: FC<F1LoadingStateProps> = ({
  variant = "default",
  rows = 8,
}) => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHIMMER_STYLE }} />
      <div role="status" aria-label={`Loading ${variant}`}>
        {variant === "chart-tall" && <ChartTall />}
        {variant === "chart-short" && <ChartShort />}
        {variant === "telemetry" && <TelemetryVariant />}
        {variant === "table-rows" && <TableRowsVariant rows={rows} />}
        {variant === "gantt" && <GanttVariant />}
        {variant === "stat-strip" && <StatStripVariant />}
        {variant === "driver-hero" && <DriverHeroVariant />}
        {variant === "default" && <SkeletonBar height={120} />}
      </div>
    </>
  );
};

export default F1LoadingState;
