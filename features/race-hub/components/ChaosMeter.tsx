"use client";

import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { useQuery } from "@tanstack/react-query";
import { OrbStatus } from "@/components/v2/OrbStatus";
import { Stat } from "@/components/v2/Stat";
import { api, isPending } from "@/Lib/api/v2/client";
import { v2Queries } from "@/Lib/api/v2/queries";
import type { ChaosTarget, LapsChaos } from "@/Lib/api/v2/payloads";

const BAR_TARGETS: [ChaosTarget, string][] = [
  ["sc_vsc_red", "Safety car, VSC or red flag"],
  ["dnf_mechanical", "Mechanical DNF"],
  ["dnf_incident", "Incident DNF"],
  ["slow_stop", "Slow pit stop"],
];
const pct = (v: number) => `${Math.round(v * 100)}%`;

function Bars({ targets }: { targets: Partial<Record<ChaosTarget, { probability: number; p10: number; p90: number }>> }) {
  return (
    <VStack gap={2} role="list" aria-label="Probability per event with p10 to p90 range">
      {BAR_TARGETS.filter(([k]) => targets[k]).map(([k, label]) => {
        const t = targets[k]!;
        return (
          <VStack gap={0.5} key={k} role="listitem">
            <HStack justify="between">
              <Text>{label}</Text>
              <Text className="f1-num" weight="semibold">{pct(t.probability)} <Text color="secondary" as="span">({pct(t.p10)} to {pct(t.p90)})</Text></Text>
            </HStack>
            <svg viewBox="0 0 100 8" width="100%" height="8" preserveAspectRatio="none" aria-hidden>
              <rect width="100" height="8" rx="2" fill="var(--color-background-muted)" />
              <rect width={t.probability * 100} height="8" rx="2" fill="var(--color-text-secondary)" />
              <rect x={t.p10 * 100} y="2" width={Math.max(0.6, (t.p90 - t.p10) * 100)} height="4" fill="var(--color-text-primary)" opacity="0.55" />
            </svg>
          </VStack>
        );
      })}
    </VStack>
  );
}

/** One cell per 5-lap window; sand intensity = probability relative to the strip's maximum. */
export function HeatStrip({ data }: { data: LapsChaos }) {
  const max = Math.max(0.01, ...data.strip.map((v) => v ?? 0));
  return (
    <VStack gap={1}>
      <svg viewBox={`0 0 ${data.windows.length * 10} 16`} width="100%" height="40" preserveAspectRatio="none" role="img"
        aria-label={`Risk by lap window; peak ${pct(max)}`}>
        {data.windows.map((w, i) => {
          const v = data.strip[i] ?? 0;
          return (
            <rect key={w.window} x={i * 10 + 0.5} width="9" height="16" rx="1.5" fill="var(--color-text-primary)" opacity={0.08 + 0.85 * (v / max)}>
              <title>{`Laps ${w.lap_start} to ${w.lap_end}: ${pct(v)}`}</title>
            </rect>
          );
        })}
      </svg>
      <HStack justify="between">
        <Text color="secondary" className="f1-num">Lap 1</Text>
        <Text color="secondary" className="f1-num">Lap {data.meta.total_laps ?? data.windows.at(-1)?.lap_end}</Text>
      </HStack>
    </VStack>
  );
}

export function ChaosMeter({ year, round }: { year: number; round: number }) {
  const race = useQuery(v2Queries.raceChaos(year, round));
  const laps = useQuery({
    queryKey: ["v2", "chaos-laps", year, round, "sc_vsc_red"],
    queryFn: () => api.raceLaps(year, round, "sc_vsc_red"),
    refetchInterval: (q) => (isPending(q.state.data) ? 2000 : false),
  });
  const d = race.data;

  return (
    <Card padding={4}>
      <VStack gap={4}>
        <HStack justify="between" align="center" gap={2}>
          <Heading level={2}>Chaos meter</Heading>
          {d && !isPending(d) ? (
            <Badge label={d.model.is_fallback ? "Baseline fallback" : d.model.calibrated ? "Calibrated" : "Uncalibrated"} variant={d.model.is_fallback ? "warning" : "neutral"} />
          ) : null}
        </HStack>
        {race.isError ? (
          <Text color="secondary">Chaos predictions are not available for this race yet.</Text>
        ) : !d || isPending(d) ? (
          <OrbStatus phase="searching" message={isPending(d) ? "Building predictions for this race" : "Loading chaos meter"} />
        ) : (
          <>
            <VStack gap={1}>
              <Stat value={d.chaos_index.toFixed(2)} caption="Chaos Index: expected disruptive events" />
              <Text className="f1-num" color="secondary">Likely range {d.chaos_index_band.p10.toFixed(1)} to {d.chaos_index_band.p90.toFixed(1)} (p10 to p90)</Text>
            </VStack>
            <Bars targets={d.targets} />
            <VStack gap={1}>
              <Text weight="semibold">Risk by lap window: safety car, VSC or red flag</Text>
              {laps.data && !isPending(laps.data) ? <HeatStrip data={laps.data} /> : <OrbStatus phase="searching" message="Loading lap windows" />}
            </VStack>
            {d.model.is_fallback && d.model.fallback_reason ? <Text color="secondary">{d.model.fallback_reason}</Text> : null}
            <Link href="/chaos/model">How is this calculated?</Link>
          </>
        )}
      </VStack>
    </Card>
  );
}
