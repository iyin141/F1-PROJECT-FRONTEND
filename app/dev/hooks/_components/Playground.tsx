"use client";

import React from "react";
import { SeasonHubGroup } from "./SeasonHubTesters";
import { RaceDetailGroup } from "./RaceDetailTesters";
import { RaceAnalysisGroup } from "./RaceAnalysisTesters";
import { DriverRecordGroup } from "./DriverRecordTesters";

const NAV = [
  { id: "season-hub", label: "Season Hub", color: "bg-blue-400", count: 3 },
  { id: "race-detail", label: "Race Detail", color: "bg-purple-400", count: 7 },
  { id: "race-analysis", label: "Race Analysis", color: "bg-orange-400", count: 10 },
  { id: "driver-record", label: "Driver Record", color: "bg-green-400", count: 10 },
];

export function Playground() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <nav className="hidden lg:flex flex-col w-60 border-r border-border bg-surface sticky top-0 h-screen overflow-y-auto shrink-0">
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-accent font-mono font-bold text-sm">
              Hook Explorer
            </span>
            <span className="text-[9px] bg-accent-soft text-accent px-1.5 py-0.5 rounded font-mono font-bold border border-accent/25">
              DEV
            </span>
          </div>
          <p className="text-xs text-muted mt-1">30 hooks · 4 feature groups</p>
        </div>

        <div className="p-3 space-y-0.5 flex-1">
          {NAV.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted
                         hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${g.color}`} />
              <span className="flex-1">{g.label}</span>
              <span className="text-[10px] font-mono text-muted/40">{g.count}</span>
            </a>
          ))}
        </div>

        <div className="px-4 py-4 border-t border-border">
          <p className="text-[10px] text-muted/40 font-mono leading-relaxed">
            TanStack Query v5
            <br />
            Mount/unmount pattern — queries
            <br />
            fire only when Execute is pressed.
          </p>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 min-w-0 px-6 py-10 max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl font-bold text-foreground">Hook Explorer</h1>
            <span className="text-[10px] bg-accent-soft text-accent px-2 py-0.5 rounded font-mono font-bold border border-accent/25">
              DEV ONLY
            </span>
          </div>
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Interactive playground for all TanStack Query hooks. Expand a hook,
            fill in parameters, then press{" "}
            <kbd className="bg-surface-elevated border border-border px-1.5 py-0.5 rounded text-xs font-mono text-foreground">
              Execute
            </kbd>{" "}
            to fire the query live and inspect the response. Results are cached —
            re-executing returns instantly on cache hit.
          </p>
        </div>

        <SeasonHubGroup />
        <RaceDetailGroup />
        <RaceAnalysisGroup />
        <DriverRecordGroup />
      </main>
    </div>
  );
}
