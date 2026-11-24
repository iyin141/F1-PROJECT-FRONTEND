"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { DriverChip } from "@/components/v2/DriverChip";
import { OrbStatus } from "@/components/v2/OrbStatus";
import { useRaceResults } from "@/features/race-detail/hooks/useRaceDetail";
import { isPending } from "@/Lib/api/v2/client";
import { v2Queries } from "@/Lib/api/v2/queries";
import { loadTelemetry } from "@/Lib/api/v2/telemetryWorkerClient";
import { TEAM_BY_CODE, seriesFor } from "@/Lib/v2/palette";
import { MiniMap, type MiniMapHandle } from "./components/MiniMap";
import { LAB_CHANNELS, TelemetryStack, type DeltaSeries, type DriverSeries, type StackHandle } from "./components/TelemetryStack";

export type LabParams = { drivers: string[]; lap: number | null; startM: number | null; endM: number | null };

const FALLBACK_PICKS = ["VER", "NOR", "LEC", "PIA", "HAM", "RUS", "SAI", "ALO"];
const MIN = 2, MAX = 4;

export function TelemetryLab({ year, round, params }: { year: number; round: number; params: LabParams }) {
  const router = useRouter();
  const { drivers, lap, startM, endM } = params;
  const hasRange = startM !== null || endM !== null;

  const go = useCallback((next: Partial<LabParams>) => {
    const p = { ...params, ...next };
    const q = new URLSearchParams({ drivers: p.drivers.join(","), lap: p.lap === null ? "fastest" : String(p.lap) });
    if (p.startM !== null) q.set("start_m", String(p.startM));
    if (p.endM !== null) q.set("end_m", String(p.endM));
    router.replace(`/race/${year}/${round}/telemetry?${q}`, { scroll: false });
  }, [params, router, year, round]);

  // ---- data ----
  const results = useRaceResults(year, round);
  const picks = useMemo(() => {
    const top = results.data?.slice(0, 10).map((r) => ({ code: r.driver.code, team: r.driver.team as string })) ?? [];
    return top.length >= 2 ? top : FALLBACK_PICKS.map((code) => ({ code, team: TEAM_BY_CODE[code] }));
  }, [results.data]);
  const teamOf = (code: string) => picks.find((p) => p.code === code)?.team ?? TEAM_BY_CODE[code];
  const series = useMemo(() => seriesFor(drivers.map((code) => ({ code, team: teamOf(code) }))), [drivers, picks]); // eslint-disable-line react-hooks/exhaustive-deps

  const geometry = useQuery(v2Queries.trackMap(year, round));

  const tel = useQueries({
    queries: drivers.map((d) => ({
      queryKey: ["v2", "telemetry", year, round, d, lap, startM, endM],
      queryFn: () => loadTelemetry(year, round, {
        driver: d, lap: lap ?? undefined, start_m: startM ?? undefined, end_m: endM ?? undefined, channels: [...LAB_CHANNELS],
      }),
      staleTime: Infinity,
      meta: { persist: false },
    })),
  });
  const deltaQ = useQueries({
    queries: drivers.slice(1).map((cmp) => ({ ...v2Queries.delta(year, round, drivers[0], cmp, lap ?? "fastest") })),
  });

  const driverData: DriverSeries[] | null = useMemo(() => {
    if (!tel.length || tel.some((q) => !q.data)) return null;
    return tel.map((q, i) => ({ driver: drivers[i], colour: series[i].colour, dash: series[i].dash, x: q.data!.columns.distance_m, cols: q.data!.columns }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tel.map((q) => q.dataUpdatedAt).join(","), series]);

  const deltaPending = deltaQ.some((q) => q.data && isPending(q.data));
  const deltaData: DeltaSeries[] = useMemo(() => {
    const out: DeltaSeries[] = [];
    deltaQ.forEach((q, i) => {
      const d = q.data;
      if (!d || isPending(d)) return;
      const lo = startM ?? -Infinity, hi = endM ?? Infinity;
      const idx: number[] = [];
      d.distance.forEach((m, k) => { if (m >= lo && m <= hi) idx.push(k); });
      out.push({ cmp: drivers[i + 1], colour: series[i + 1].colour, dash: series[i + 1].dash, x: Float64Array.from(idx, (k) => d.distance[k]), y: Float64Array.from(idx, (k) => d.delta[k]) });
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deltaQ.map((q) => q.dataUpdatedAt).join(","), series, startM, endM]);

  // ---- imperative cursor path: no React state ----
  const mini = useRef<MiniMapHandle>(null);
  const readout = useRef<HTMLOutputElement>(null);
  const stack = useRef<StackHandle | null>(null);
  const bench = useRef<HTMLOutputElement>(null);
  const onReady = useCallback((h: StackHandle | null) => { stack.current = h; }, []);
  const raf = useRef(0);
  const onCursor = useCallback((d: number | null) => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      mini.current?.setDistance(d);
      if (readout.current) readout.current.textContent = d == null ? "Move over a chart to read values" : `${Math.round(d)} m`;
    });
  }, []);

  // `?bench=1` runs a scripted scrub once data is drawn and writes the timings to #lab-bench (data-bench holds JSON).
  const benchOn = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("bench");
  useEffect(() => {
    if (!benchOn || !driverData) return;
    const t = setTimeout(() => {
      const r = stack.current?.bench();
      if (r && bench.current) {
        bench.current.dataset.bench = JSON.stringify(r);
        bench.current.textContent = `Bench: ${r.cursorMoves} cursor moves, avg ${r.cursorAvgMs.toFixed(3)} ms, p95 ${r.cursorP95Ms.toFixed(3)} ms; redraw of ${r.plots} plots ${r.redrawAllMs.toFixed(1)} ms; ${r.points} points per series`;
      }
    }, 800);
    return () => clearTimeout(t);
  }, [benchOn, driverData]);

  const toggle = (code: string) => {
    const next = drivers.includes(code) ? drivers.filter((c) => c !== code) : [...drivers, code].slice(-MAX);
    if (next.length >= MIN) go({ drivers: next });
  };

  const loading = tel.some((q) => q.isLoading);
  const failed = tel.find((q) => q.isError);

  return (
    <VStack gap={4} padding={4} style={{ maxWidth: 1400, margin: "0 auto" }}>
      <HStack justify="between" align="center" wrap="wrap" gap={2}>
        <VStack gap={0.5}>
          <Heading level={1}>Telemetry lab</Heading>
          <Text color="secondary">{year} round {round}. Drag across any chart to zoom, or pick a segment on the map.</Text>
        </VStack>
        <Link href={`/race/${year}/${round}`}>Back to the race hub</Link>
      </HStack>

      <Card padding={3}>
        <HStack gap={4} wrap="wrap" align="center">
          <HStack gap={2} wrap="wrap" align="center" role="group" aria-label="Drivers, choose 2 to 4">
            <Text weight="semibold">Drivers</Text>
            {picks.map((c) => {
              const on = drivers.includes(c.code);
              const s = series[drivers.indexOf(c.code)];
              return (
                <Button key={c.code} label={c.code} size="sm" variant={on ? "secondary" : "ghost"} aria-pressed={on} onClick={() => toggle(c.code)}
                  icon={on && s ? <DriverChip code="" colour={s.colour} dashed={s.dash !== null} /> : undefined} />
              );
            })}
          </HStack>
          <HStack gap={2} align="center">
            <Text weight="semibold">Lap</Text>
            <Button label="Fastest" size="sm" variant={lap === null ? "secondary" : "ghost"} aria-pressed={lap === null} onClick={() => go({ lap: null })} />
            <label>
              <Text color="secondary" as="span" className="f1-sr-only">Lap number</Text>
              <input
                className="f1-input f1-num"
                type="number" min={1} max={99} inputMode="numeric" placeholder="Lap #" aria-label="Lap number"
                defaultValue={lap ?? ""}
                key={lap ?? "fastest"}
                onKeyDown={(e) => { if (e.key === "Enter") { const n = Number((e.target as HTMLInputElement).value); if (n >= 1) go({ lap: Math.floor(n) }); } }}
                onBlur={(e) => { const n = Number(e.target.value); if (n >= 1 && n !== lap) go({ lap: Math.floor(n) }); }}
              />
            </label>
          </HStack>
          {hasRange ? (
            <HStack gap={2} align="center">
              <Text className="f1-num">Range {startM ?? 0} to {endM ?? "end"} m</Text>
              <Button label="Reset range" size="sm" variant="ghost" onClick={() => go({ startM: null, endM: null })} />
            </HStack>
          ) : null}
        </HStack>
      </Card>

      <div className="f1-lab">
        <Card padding={3}>
          <VStack gap={2}>
            <HStack gap={4} wrap="wrap" align="center" justify="between">
              <HStack gap={4} wrap="wrap">
                {series.map((s) => <DriverChip key={s.driver} code={s.driver} colour={s.colour} dashed={s.dash !== null} />)}
              </HStack>
              <Text color="secondary">Delta: positive means {drivers[1] ?? "the other driver"} is slower than {drivers[0]}.</Text>
            </HStack>
            {failed ? (
              <Text color="secondary">Telemetry is not available for these drivers or this lap. {failed.error instanceof Error ? failed.error.message : ""}</Text>
            ) : loading || !driverData ? (
              <OrbStatus phase="searching" message="Loading telemetry" />
            ) : (
              <>
                {deltaPending ? <OrbStatus phase="solving" message="Building the delta trace for this race" /> : null}
                <TelemetryStack
                  drivers={driverData}
                  delta={deltaData}
                  corners={geometry.data?.corners ?? []}
                  onCursor={onCursor}
                  onBrush={(a, b) => go({ startM: Math.max(0, a), endM: b })}
                  onReady={onReady}
                />
              </>
            )}
          </VStack>
        </Card>
        <aside className="f1-lab-side">
          <Card padding={3}>
            <VStack gap={2}>
              <Text weight="semibold">Cursor</Text>
              <output ref={readout} className="f1-num" aria-live="off">Move over a chart to read values</output>
              {geometry.data ? (
                <MiniMap handle={mini} geometry={geometry.data} range={{ start_m: startM ?? undefined, end_m: endM ?? undefined }} onPick={(a, b) => go({ startM: a, endM: b })} />
              ) : (
                <OrbStatus phase="searching" message="Loading the circuit" />
              )}
              <output ref={bench} id="lab-bench" className="f1-num" />
            </VStack>
          </Card>
        </aside>
      </div>
    </VStack>
  );
}
