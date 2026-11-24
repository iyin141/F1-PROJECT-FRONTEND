"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { OrbStatus } from "@/components/v2/OrbStatus";
import { api } from "@/Lib/api/v2/client";
import type { CircuitRates } from "@/Lib/api/v2/payloads";

type SortKey = "name" | "sc" | "red" | "dnf";
const pct = (v: number | null) => (v === null ? "no data" : `${Math.round(v * 100)}%`);
const dnf = (h: CircuitRates) => (h.mean_mechanical_dnfs ?? 0) + (h.mean_incident_dnfs ?? 0);

/** One row of a small multiple: the same scale on every card, so bars compare across circuits. */
function Rate({ label, value, max, text }: { label: string; value: number | null; max: number; text: string }) {
  return (
    <HStack gap={2} align="center">
      <Text style={{ width: 78 }} color="secondary">
        {label}
      </Text>
      <svg viewBox="0 0 100 8" width="100%" height="8" preserveAspectRatio="none" aria-hidden style={{ flex: 1 }}>
        <rect width="100" height="8" rx="2" fill="var(--color-background-muted)" />
        {value !== null ? <rect width={Math.min(100, (value / max) * 100)} height="8" rx="2" fill="var(--color-text-secondary)" /> : null}
      </svg>
      <Text className="f1-num" style={{ width: 60, textAlign: "right" }}>
        {text}
      </Text>
    </HStack>
  );
}

/** Small multiples of every circuit's safety-car, red-flag and retirement history, sortable. */
export function CircuitGrid() {
  const [sort, setSort] = useState<SortKey>("sc");
  const q = useQuery({ queryKey: ["v2", "chaos-circuits-summary"], queryFn: () => api.circuitsSummary(), staleTime: Infinity });
  const rows = useMemo(() => {
    const out = [...(q.data?.circuits ?? [])];
    const val = (r: (typeof out)[number]) => (r.summary.races === 0 ? -1 : sort === "sc" ? r.summary.safety_car_rate ?? -1 : sort === "red" ? r.summary.red_flag_rate ?? -1 : dnf(r.summary));
    return out.sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : val(b) - val(a)));
  }, [q.data, sort]);

  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack justify="between" align="center" wrap="wrap" gap={2}>
          <Heading level={2}>Circuit history</Heading>
          <SegmentedControl label="Sort circuits by" value={sort} onChange={(v) => setSort(v as SortKey)} size="sm">
            <SegmentedControlItem value="sc" label="Safety cars" />
            <SegmentedControlItem value="red" label="Red flags" />
            <SegmentedControlItem value="dnf" label="Retirements" />
            <SegmentedControlItem value="name" label="Name" />
          </SegmentedControl>
        </HStack>
        <Text color="secondary">Share of past races with a safety car or a red flag, and retirements per race. Every card uses the same scale.</Text>
        {q.isError ? (
          <Text color="secondary">The circuit summary is not available.</Text>
        ) : !q.data ? (
          <OrbStatus phase="searching" message="Loading circuits" />
        ) : (
          <>
            <div className="f1-grid">
              {rows.map((c) => (
                <Card key={c.slug} padding={3} variant="muted">
                  <VStack gap={2}>
                    <HStack justify="between" align="center">
                      <Text weight="semibold">{c.name}</Text>
                      {c.type ? <Badge label={c.type} variant="neutral" /> : null}
                    </HStack>
                    {c.summary.races > 0 ? (
                      <>
                        <Rate label="Safety car" value={c.summary.safety_car_rate} max={1} text={pct(c.summary.safety_car_rate)} />
                        <Rate label="Red flag" value={c.summary.red_flag_rate} max={1} text={pct(c.summary.red_flag_rate)} />
                        <Rate label="DNFs / race" value={dnf(c.summary)} max={4} text={dnf(c.summary).toFixed(1)} />
                        <Text color="secondary" className="f1-num">{c.summary.races} races</Text>
                      </>
                    ) : (
                      <Text color="secondary">No stored races yet.</Text>
                    )}
                  </VStack>
                </Card>
              ))}
            </div>
            {q.data.unmatched_circuits.length ? (
              <Text color="secondary">Races not matched to a known circuit: {q.data.unmatched_circuits.join(", ")}.</Text>
            ) : null}
          </>
        )}
      </VStack>
    </Card>
  );
}
