"use client";

import { VStack } from "@astryxdesign/core/VStack";
import { useSeasonSchedule } from "@/features/season-hub/hooks/useSeasonHub";
import { ChaosHeader } from "./components/ChaosNav";
import { ChaosPreview } from "./components/ChaosPreview";
import { CircuitGrid } from "./components/CircuitGrid";
import { DriverTendencies } from "./components/DriverTendencies";

/** `/chaos`: the next race's preview, then circuit history, then driver tendencies. `?year=&round=` overrides the race. */
export function ChaosHome({ year, round }: { year: number; round: number | null }) {
  const schedule = useSeasonSchedule(year);
  const next = schedule.data?.find((r) => r.status !== "completed");
  const chosen = round ?? next?.round ?? schedule.data?.at(-1)?.round ?? 1;
  const name = schedule.data?.find((r) => r.round === chosen)?.name;

  return (
    <VStack gap={4} padding={4} style={{ maxWidth: 1200, margin: "0 auto" }}>
      <ChaosHeader
        current="preview"
        title="Chaos"
        lead="How disruptive will the next race be? Probabilities for safety cars, retirements and pit-stop trouble, from a model that always says which version produced the numbers."
      />
      <ChaosPreview year={year} round={chosen} name={name} />
      <CircuitGrid />
      <DriverTendencies />
    </VStack>
  );
}
