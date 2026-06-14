'use client';

import React from 'react';
import { formatLapMs } from '@/Lib/format';
import { CompoundDot } from '@/components/CompoundDot';
import { normalizeCompound } from '@/features/race-analysis/utils/compoundHelpers';
import type { Driver } from '@/types/ui';

type Performer = {
  driver: Driver;
  avgLapMs: number | null;
  compoundsUsed: string[];
  lapCount: number;
};

export default function RangeTopPerformers({
  data,
}: {
  data: { label: string; performers: Performer[] }[];
}) {
  if (!data || data.length === 0) return null;

  // use shared normalizeCompound helper

  return (
    <div className="space-y-4">
      {data.map((r) => (
        <div key={r.label}>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{r.label}</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {r.performers.map((p, idx) => (
              <div key={p.driver.code} className="flex items-center gap-3 rounded-sm border border-border-subtle p-3" style={{ backgroundColor: 'var(--surface)' }}>
                <div className="flex flex-col">
                  <span className="font-mono text-[12px] font-bold" style={{ color: 'hsl(var(--text))' }}>{idx + 1}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-mono font-semibold">{p.driver.code}</div>
                    <div className="font-mono text-[11px] text-right tabular-nums">{p.avgLapMs != null ? formatLapMs(p.avgLapMs) : '—'}</div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {p.compoundsUsed.length ? p.compoundsUsed.map((c) => {
                      const norm = normalizeCompound(c);
                      const dotCompound = norm === 'unknown' ? 'medium' : norm;
                      return (
                        <div key={String(c)} className="flex items-center gap-1">
                          <CompoundDot compound={dotCompound as any} />
                          <span className="font-mono text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{norm === 'unknown' ? 'unknown' : String(c)}</span>
                        </div>
                      );
                    }) : <span className="font-mono text-[10px]" style={{ color: 'hsl(var(--muted-2))' }}>unknown</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
