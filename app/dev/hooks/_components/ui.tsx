"use client";

import React, { useState } from "react";

// ---------------------------------------------------------------------------
// ParamField — text / number input
// ---------------------------------------------------------------------------
interface ParamFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  note?: string;
}

export function ParamField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  note,
}: ParamFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-mono font-bold text-muted uppercase tracking-widest">
        {label}
        {note && (
          <span className="ml-2 text-[10px] normal-case tracking-normal font-normal text-muted/60">
            — {note}
          </span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm font-mono
                   text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent
                   focus:ring-1 focus:ring-ring transition-colors"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SelectField — dropdown
// ---------------------------------------------------------------------------
interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  note?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  note,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-mono font-bold text-muted uppercase tracking-widest">
        {label}
        {note && (
          <span className="ml-2 text-[10px] normal-case tracking-normal font-normal text-muted/60">
            — {note}
          </span>
        )}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm font-mono
                   text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-ring
                   transition-colors appearance-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------
export type QueryStatus = "idle" | "pending" | "success" | "error";

export function StatusBadge({ status }: { status: QueryStatus }) {
  const map: Record<QueryStatus, { label: string; cls: string }> = {
    idle: {
      label: "IDLE",
      cls: "bg-surface-elevated text-muted border border-border",
    },
    pending: {
      label: "LOADING",
      cls: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
    },
    success: {
      label: "SUCCESS",
      cls: "bg-green-500/15 text-green-400 border border-green-500/30",
    },
    error: {
      label: "ERROR",
      cls: "bg-red-500/15 text-red-400 border border-red-500/30",
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full tracking-widest ${cls}`}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ResultPanel — formatted JSON response viewer
// ---------------------------------------------------------------------------
interface ResultPanelProps {
  status: QueryStatus;
  data: unknown;
  error: Error | null;
  updatedAt?: number;
}

export function ResultPanel({
  status,
  data,
  error,
  updatedAt,
}: ResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const content = error ? { error: error.message } : data;

  function copy() {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-3 rounded-xl border border-border overflow-hidden">
      {/* toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          {updatedAt && updatedAt > 0 && (
            <span className="text-[10px] text-muted font-mono">
              {new Date(updatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
        {content !== undefined &&
          status !== "idle" &&
          status !== "pending" && (
            <button
              onClick={copy}
              className="text-[11px] text-muted hover:text-foreground transition-colors font-mono
                         px-2 py-0.5 rounded hover:bg-surface-elevated"
            >
              {copied ? "✓ copied" : "copy JSON"}
            </button>
          )}
      </div>

      {/* response body */}
      <div className="bg-surface-muted p-4 max-h-120 overflow-auto">
        {status === "idle" && (
          <p className="text-muted/50 text-xs font-mono">
            // Hit Execute to fire the query
          </p>
        )}
        {status === "pending" && (
          <p className="text-yellow-400/80 text-xs font-mono animate-pulse">
            // Fetching…
          </p>
        )}
        {(status === "success" || status === "error") && (
          <pre className="text-xs font-mono text-foreground whitespace-pre-wrap wrap-break-word leading-relaxed">
            {JSON.stringify(content, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExecuteBar — run / reset buttons
// ---------------------------------------------------------------------------
interface ExecuteBarProps {
  onExecute: () => void;
  onReset: () => void;
  hasResult: boolean;
}

export function ExecuteBar({ onExecute, onReset, hasResult }: ExecuteBarProps) {
  return (
    <div className="flex gap-2 pt-1">
      <button
        onClick={onExecute}
        className="px-4 py-1.5 bg-accent text-white text-xs font-mono font-bold rounded-lg
                   hover:bg-accent/85 active:scale-95 transition-all"
      >
        Execute
      </button>
      {hasResult && (
        <button
          onClick={onReset}
          className="px-4 py-1.5 bg-surface-elevated text-muted text-xs font-mono rounded-lg
                     hover:text-foreground border border-border hover:bg-border transition-all"
        >
          Reset
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HookCard — collapsible accordion card
// ---------------------------------------------------------------------------
const GROUP_TAG_COLORS: Record<string, string> = {
  "Season Hub":
    "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  "Race Detail":
    "bg-purple-500/15 text-purple-400 border border-purple-500/25",
  "Race Analysis":
    "bg-orange-500/15 text-orange-400 border border-orange-500/25",
  "Driver Career":
    "bg-green-500/15 text-green-400 border border-green-500/25",
  "Driver Season":
    "bg-teal-500/15 text-teal-400 border border-teal-500/25",
  "Driver Analysis":
    "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25",
  "Driver Telemetry":
    "bg-pink-500/15 text-pink-400 border border-pink-500/25",
};

interface HookCardProps {
  name: string;
  signature: string;
  description: string;
  queryKey?: string;
  group: string;
  warning?: string;
  children: React.ReactNode;
}

export function HookCard({
  name,
  signature,
  description,
  queryKey,
  group,
  warning,
  children,
}: HookCardProps) {
  const [open, setOpen] = useState(false);
  const tagCls =
    GROUP_TAG_COLORS[group] ??
    "bg-surface-elevated text-muted border border-border";

  return (
    <div
      id={`hook-${name}`}
      className="rounded-xl border border-border bg-surface overflow-hidden mb-3"
    >
      {/* header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-surface-elevated
                   transition-colors text-left"
      >
        <span
          className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase ${tagCls}`}
        >
          {group}
        </span>
        <div className="flex-1 min-w-0">
          <span className="font-mono font-semibold text-foreground text-sm">
            {name}
          </span>
          <span className="ml-2 font-mono text-xs text-muted/70 hidden sm:inline">
            ({signature})
          </span>
        </div>
        <span className="text-muted text-base leading-none shrink-0">
          {open ? "−" : "+"}
        </span>
      </button>

      {/* expanded body */}
      {open && (
        <div className="px-5 pb-5 border-t border-border">
          <p className="text-sm text-muted mt-4 mb-4 leading-relaxed">
            {description}
          </p>

          {warning && (
            <div className="mb-4 flex gap-2 rounded-lg border border-yellow-500/25 bg-yellow-500/8 px-3 py-2.5">
              <span className="text-yellow-400 shrink-0">⚠</span>
              <span className="text-xs text-yellow-300/90 leading-relaxed">
                {warning}
              </span>
            </div>
          )}

          {queryKey && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-muted font-mono">cache key:</span>
              <code className="text-[11px] bg-surface-elevated border border-border px-2 py-0.5 rounded text-accent font-mono">
                {queryKey}
              </code>
            </div>
          )}

          <div className="space-y-3">{children}</div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// GroupSection — titled section with left colour bar
// ---------------------------------------------------------------------------
const SECTION_BAR_COLORS: Record<string, string> = {
  "Season Hub": "bg-blue-400",
  "Race Detail": "bg-purple-400",
  "Race Analysis": "bg-orange-400",
  "Driver Record": "bg-green-400",
};

interface GroupSectionProps {
  id: string;
  title: string;
  description: string;
  count: number;
  children: React.ReactNode;
}

export function GroupSection({
  id,
  title,
  description,
  count,
  children,
}: GroupSectionProps) {
  const barColor = SECTION_BAR_COLORS[title] ?? "bg-accent";
  return (
    <section id={id} className="mb-12 scroll-mt-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
        <div className={`w-1 h-8 rounded-full ${barColor}`} />
        <div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted">
            {description} —{" "}
            <span className="text-foreground font-mono">{count}</span> hook
            {count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}
