'use client';

import { teamColor } from "@/components/DriverCode";
import type { TeamId } from "@/types/ui";

export type AnalysisDriverOption = {
  id: string;
  code: string;
  team: TeamId;
  firstName: string;
  lastName: string;
};

export function DriverSelect({
  label,
  value,
  onChange,
  drivers,
  accent,
  allowEmpty = false,
  emptyLabel = "SELECT DRIVER",
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  drivers: AnalysisDriverOption[];
  accent: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}) {
  const selectedDriver = value ? drivers.find((d) => d.id === value) : undefined;

  return (
    <label className="flex items-center gap-2">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{ color: accent }}
      >
        {label}
      </span>
      {selectedDriver && (
        <span
          className="h-3 w-0.75 rounded-sm"
          style={{ background: teamColor(selectedDriver.team) }}
        />
      )}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="border border-border-subtle px-2 py-1 font-mono text-[11px] tracking-[0.06em] outline-none"
        style={{ backgroundColor: "hsl(var(--bg))", color: "hsl(var(--text))" }}
      >
        {allowEmpty && (
          <option value="" style={{ backgroundColor: "hsl(var(--bg))" }}>
            {emptyLabel}
          </option>
        )}
        {drivers.map((d) => (
          <option key={d.id} value={d.id} style={{ backgroundColor: "hsl(var(--bg))" }}>
            {d.code} - {d.firstName} {d.lastName}
          </option>
        ))}
      </select>
    </label>
  );
}