'use client';

import React from "react";
import { DriverSelect, type AnalysisDriverOption } from "./DriverSelect";

export type SessionSelectorProps = {
  value: string;
  onChange: (session: string) => void;
  availableSessions: Array<{ code: string; label: string }>;
  driverA?: string | null;
  driverB?: string | null;
  onDriverAChange?: (v: string | null) => void;
  onDriverBChange?: (v: string | null) => void;
  drivers?: AnalysisDriverOption[];
};

export function SessionSelector({
  value,
  onChange,
  availableSessions,
  driverA,
  driverB,
  onDriverAChange,
  onDriverBChange,
  drivers,
}: SessionSelectorProps) {
  return (
    <div className="sticky top-0 z-20 flex h-[44px] w-auto items-center justify-between border-b border-border-subtle bg-[#0A0A0F]">
      <div className="flex h-full items-center">
        {availableSessions.map((s) => {
          const isActive = s.code === value;
          return (
            <button
              key={s.code}
              type="button"
              onClick={() => onChange(s.code)}
              className="flex h-full items-center px-6 font-mono text-[11px] uppercase tracking-wider outline-none transition-colors"
              style={{
                backgroundColor: isActive ? "#E10600" : "transparent",
                color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.35)",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {(onDriverAChange || onDriverBChange) && drivers && (
        <div className="flex items-center gap-6 px-4">
          {onDriverAChange && (
            <DriverSelect
              label="DRIVER A"
              value={driverA ?? null}
              onChange={onDriverAChange}
              drivers={drivers}
              accent="#FFFFFF"
            />
          )}
          {onDriverBChange && (
            <DriverSelect
              label="DRIVER B"
              value={driverB ?? null}
              onChange={onDriverBChange}
              drivers={drivers}
              accent="#FFFFFF"
            />
          )}
        </div>
      )}
    </div>
  );
}
