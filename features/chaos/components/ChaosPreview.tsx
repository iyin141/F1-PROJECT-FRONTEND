"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { OrbStatus } from "@/components/v2/OrbStatus";
import { Stat } from "@/components/v2/Stat";
import { Bars, HeatStrip } from "@/features/race-hub/components/ChaosMeter";
import { api, isPending } from "@/Lib/api/v2/client";
import { v2Queries } from "@/Lib/api/v2/queries";
import type { ChaosTarget } from "@/Lib/api/v2/payloads";
import { ModelNote } from "./ModelNote";

const TARGETS: [ChaosTarget, string][] = [
  ["sc_vsc_red", "Safety car, VSC or red flag"],
  ["dnf_mechanical", "Mechanical DNF"],
  ["dnf_incident", "Incident DNF"],
  ["slow_stop", "Slow pit stop"],
  ["unlucky_stop", "Unlucky stop"],
];

/** Upcoming-race preview: index and band, per-target probabilities with bands, top factors, lap-window strip. */
export function ChaosPreview({ year, round, name }: { year: number; round: number; name?: string }) {
  const race = useQuery(v2Queries.raceChaos(year, round));
  const [target, setTarget] = useState<ChaosTarget>("sc_vsc_red");
  const laps = useQuery({
    queryKey: ["v2", "chaos-laps", year, round, target],
    queryFn: () => api.raceLaps(year, round, target),
    refetchInterval: (q) => (isPending(q.state.data) ? 2000 : false),
  });
  const d = race.data;

  return (
    <Card padding={4}>
      <VStack gap={4}>
        <HStack justify="between" align="center" wrap="wrap" gap={2}>
          <Heading level={2}>{name ?? `${year} round ${round}`}: race preview</Heading>
          <Link href={`/race/${year}/${round}`}>Open the race hub</Link>
        </HStack>
        {race.isError ? (
          <Text color="secondary">No chaos predictions exist for this race yet. {race.error instanceof Error ? race.error.message : ""}</Text>
        ) : !d || isPending(d) ? (
          <OrbStatus phase="searching" message={d ? "Building predictions for this race" : "Loading the preview"} />
        ) : (
          <>
            <ModelNote model={d.model} />
            <div className="f1-two">
              <VStack gap={3}>
                <VStack gap={1}>
                  <Stat value={d.chaos_index.toFixed(2)} caption="Chaos Index: expected disruptive events" />
                  <Text className="f1-num" color="secondary">
                    Likely range {d.chaos_index_band.p10.toFixed(1)} to {d.chaos_index_band.p90.toFixed(1)} (p10 to p90)
                  </Text>
                  <Text color="secondary">{d.chaos_index_band.note}</Text>
                </VStack>
                <Bars targets={d.targets} />
              </VStack>
              <VStack gap={2}>
                <Text weight="semibold">Top factors vs a typical {d.meta.circuit_type ?? "circuit"} race</Text>
                {d.factors.length === 0 ? (
                  <Text color="secondary">No factor comparison is available.</Text>
                ) : (
                  <VStack gap={2} as="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {d.factors.map((f) => (
                      <li key={f.target}>
                        <HStack gap={2} align="start">
                          <Text weight="semibold" style={{ minWidth: 52 }}>{f.direction === "higher" ? "Higher" : "Lower"}</Text>
                          <Text>{f.text}</Text>
                        </HStack>
                      </li>
                    ))}
                  </VStack>
                )}
              </VStack>
            </div>
            <VStack gap={2}>
              <Text weight="semibold">Risk by 5-lap window</Text>
              <SegmentedControl label="Event" value={target} onChange={(v) => setTarget(v as ChaosTarget)} size="sm">
                {TARGETS.map(([k, l]) => (
                  <SegmentedControlItem key={k} value={k} label={l} />
                ))}
              </SegmentedControl>
              {laps.data && !isPending(laps.data) ? (
                <>
                  <HeatStrip data={laps.data} />
                  <Text color="secondary">
                    Model: {laps.data.model.model}
                    {laps.data.model.is_fallback ? " (fallback)" : ""}
                  </Text>
                </>
              ) : laps.isError ? (
                <Text color="secondary">No lap-window data for this event.</Text>
              ) : (
                <OrbStatus phase="searching" message="Loading lap windows" />
              )}
            </VStack>
          </>
        )}
      </VStack>
    </Card>
  );
}
