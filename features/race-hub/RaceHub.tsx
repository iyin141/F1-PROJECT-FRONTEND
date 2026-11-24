"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import { seriesFor } from "@/Lib/v2/palette";
import { ChaosMeter } from "./components/ChaosMeter";
import { HubTabs } from "./components/HubTabs";
import { TrackMap, type SectorRange } from "./components/TrackMap";

const DEFAULT_DRIVERS = ["VER", "NOR"];
const MAX_DRIVERS = 4;

export function RaceHub({ year, round }: { year: number; round: number }) {
  const router = useRouter();
  const results = useRaceResults(year, round);
  const candidates = useMemo(() => {
    const top = results.data?.slice(0, 6).map((r) => ({ code: r.driver.code, team: r.driver.team as string })) ?? [];
    return top.length >= 2 ? top : DEFAULT_DRIVERS.map((code) => ({ code, team: undefined as string | undefined }));
  }, [results.data]);
  const [picked, setPicked] = useState<string[] | null>(null);
  const selected = picked ?? candidates.slice(0, 2).map((c) => c.code);

  const geometry = useQuery(v2Queries.trackMap(year, round));
  const sectors = useQuery(v2Queries.miniSectors(year, round, selected));
  const series = useMemo(() => seriesFor(candidates.filter((c) => selected.includes(c.code))), [candidates, selected]);

  const toggle = (code: string) =>
    setPicked(selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code].slice(-MAX_DRIVERS));

  const openLab = (r: SectorRange) =>
    router.push(`/race/${year}/${round}/telemetry?drivers=${selected.join(",")}&lap=fastest&start_m=${Math.round(r.start_m)}&end_m=${Math.round(r.end_m)}`);

  const sectorData = sectors.data && !isPending(sectors.data) ? sectors.data : undefined;

  return (
    <VStack gap={4} padding={4} style={{ maxWidth: 1400, margin: "0 auto" }}>
      <HStack justify="between" align="center" wrap="wrap" gap={2}>
        <VStack gap={0.5}>
          <Heading level={1}>{year} round {round}</Heading>
          <Text color="secondary">Pick a segment of the circuit to compare drivers there.</Text>
        </VStack>
        <HStack gap={3} wrap="wrap">
          <Button label="Telemetry lab" variant="primary" href={`/race/${year}/${round}/telemetry?drivers=${selected.join(",")}&lap=fastest`} />
          <Link href={`/race/${year}/${round}/classic`}>Classic view</Link>
        </HStack>
      </HStack>

      <div className="f1-hub">
        <Card padding={4}>
          <VStack gap={3}>
            <HStack gap={2} wrap="wrap" align="center">
              <Text weight="semibold">Compare</Text>
              {candidates.map((c) => {
                const on = selected.includes(c.code);
                const s = series.find((x) => x.driver === c.code);
                return (
                  <Button key={c.code} label={c.code} size="sm" variant={on ? "secondary" : "ghost"} aria-pressed={on} onClick={() => toggle(c.code)}
                    icon={on && s ? <DriverChip code="" colour={s.colour} dashed={s.dash !== null} /> : undefined} />
                );
              })}
            </HStack>
            {geometry.isError ? (
              <Text color="secondary">The circuit map is not available for this race yet.</Text>
            ) : !geometry.data ? (
              <OrbStatus phase="searching" message="Loading the circuit" />
            ) : (
              <>
                <TrackMap geometry={geometry.data} sectors={sectorData} series={series} onSelect={openLab} />
                {sectors.data && isPending(sectors.data) ? <OrbStatus phase="solving" message="Building segment times for this race" /> : null}
                {sectors.isError ? <Text color="secondary">Segment times are not available for these drivers.</Text> : null}
              </>
            )}
          </VStack>
        </Card>
        <ChaosMeter year={year} round={round} />
      </div>

      <HubTabs year={year} round={round} />
    </VStack>
  );
}
