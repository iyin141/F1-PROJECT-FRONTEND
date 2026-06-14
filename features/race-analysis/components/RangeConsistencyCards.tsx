'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { teamColor } from '@/components/DriverCode';
import { CompoundDot } from '@/components/CompoundDot';
import { formatLapMs } from '@/Lib/format';
import { normalizeCompound } from '@/features/race-analysis/utils/compoundHelpers';
import type { Range, RangeMetrics } from '@/features/race-analysis/utils/overviewUtils';
import type { ConsistencyScore } from '@/types/ui';

export default function RangeConsistencyCards({
  ranges,
  consistency,
  metrics,
}: {
  ranges: Range[];
  consistency: ConsistencyScore[][];
  metrics: Record<string, RangeMetrics[]>;
}) {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeScores = consistency?.[active] ?? [];

  useEffect(() => {
    if (!containerRef.current) return;
    const counters = containerRef.current.querySelectorAll<HTMLElement>('[data-counter]');
    counters.forEach((el) => {
      const target = Number(el.dataset.counter ?? 0);
      const proxy = { v: 0 };
      gsap.to(proxy, {
        v: target,
        duration: 1.1,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = proxy.v.toFixed(0); },
      });
    });
  }, [active, activeScores]);

  if (!ranges || !consistency) return null;

  return (
    <div>
      {/* Tabs */}
      <div
        className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-4 py-2.5"
        style={{ backgroundColor: 'var(--surface2)' }}
      >
        {ranges.map((r, i) => {
          const isActive = i === active;
          return (
            <button
              key={r.label}
              onClick={() => setActive(i)}
              className="border border-border-subtle px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors"
              style={{
                backgroundColor: isActive ? 'hsl(var(--red))' : 'transparent',
                color: isActive ? 'hsl(var(--text))' : 'hsl(var(--muted))',
              }}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div ref={containerRef} className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-5" style={{ backgroundColor: 'hsl(var(--border-subtle))' }}>
        {activeScores.length === 0 ? (
          <div className="flex h-24 items-center justify-center font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'hsl(var(--muted-2))' }}>Too few laps for this range</div>
        ) : (
          activeScores.map((s) => {
            const drv = s.driver.code;
            const metric = metrics?.[drv]?.[active] as RangeMetrics | undefined;
            const avgSectorMs = metric?.avgSectorMs ?? null;
            const compounds = metric?.compoundsUsed ?? [];
            return (
              <div key={s.driver.id} className="flex flex-col gap-2.5 p-3" style={{ backgroundColor: 'var(--surface)' }}>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-0.75 shrink-0 rounded-sm" style={{ background: teamColor(s.driver.team) }} />
                  <span className="font-mono text-[12px] font-bold tracking-[0.06em]" style={{ color: 'hsl(var(--text))' }}>{s.driver.code}</span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span data-counter={s.score} className="font-display text-2xl font-semibold tabular-nums" style={{ color: 'hsl(var(--text))' }}>0</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: 'hsl(var(--muted))' }}>SCORE</span>
                </div>

                <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--surface2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, s.score)}%`, backgroundColor: 'hsl(var(--red))' }} />
                </div>

                <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 font-mono text-[9px] uppercase tracking-[0.16em]">
                  <dt style={{ color: 'hsl(var(--muted))' }}>BEST</dt>
                  <dd className="text-right normal-case tracking-normal tabular-nums" style={{ color: 'hsl(var(--text-dim))' }}>{formatLapMs(s.bestLapMs)}</dd>

                  <dt style={{ color: 'hsl(var(--muted))' }}>AVG LAP</dt>
                  <dd className="text-right normal-case tracking-normal tabular-nums" style={{ color: 'hsl(var(--text-dim))' }}>{formatLapMs(s.avgLapMs)}</dd>

                  <dt style={{ color: 'hsl(var(--muted))' }}>AVG SECTOR</dt>
                  <dd className="text-right normal-case tracking-normal tabular-nums" style={{ color: 'hsl(var(--text-dim))' }}>{avgSectorMs != null ? formatLapMs(avgSectorMs) : '—'}</dd>

                  <dt style={{ color: 'hsl(var(--muted))' }}>TYRES</dt>
                  <dd className="flex justify-end gap-2 items-center">
                    {compounds.length ? compounds.map((c) => {
                      const norm = normalizeCompound(c);
                      const dot = norm === 'unknown' ? 'medium' : norm;
                      return (
                        <span key={String(c)} className="flex items-center gap-1">
                          <CompoundDot compound={dot as any} />
                          <span className="font-mono text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{norm === 'unknown' ? 'unknown' : String(c)}</span>
                        </span>
                      );
                    }) : <span className="font-mono text-[10px]" style={{ color: 'hsl(var(--muted-2))' }}>unknown</span>}
                  </dd>
                </dl>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
