"use client";

import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { OrbStatus } from "@/components/v2/OrbStatus";
import { api } from "@/Lib/api/v2/client";
import type { CircuitHistory } from "@/Lib/api/v2/payloads";

type SortKey = "name" | "sc" | "red" | "dnf";
const pct = (v: number | null) => (v === null ? "no data" : `${Math.round(v * 100)}%`);
const dnf = (h: CircuitHistory) => (h.summary.mean_mechanical_dnfs ?? 0) + (h.summary.mean_incident_dnfs ?? 0);

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
  const list = useQuery({ queryKey: ["v2", "chaos-circuits"], queryFn: () => api.circuits(), staleTime: Infinity });
  const hist = useQueries({
    queries: (list.data ?? []).map((c) => ({ queryKey: ["v2", "chaos-circuit", c.slug], queryFn: () => api.circuitHistory(c.slug), staleTime: Infinity })),
  });
  const rows = useMemo(() => {
    const out = (list.data ?? []).map((c, i) => ({ c, h: hist[i]?.data as CircuitHistory | undefined, failed: hist[i]?.isError }));
    const val = (r: (typeof out)[number]) => (sort === "sc" ? r.h?.summary.safety_car_rate ?? -1 : sort === "red" ? r.h?.summary.red_flag_rate ?? -1 : r.h ? dnf(r.h) : -1);
    return out.sort((a, b) => (sort === "name" ? a.c.name.localeCompare(b.c.name) : val(b) - val(a)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.data, hist.map((q) => q.dataUpdatedAt).join(","), sort]);

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
        {list.isError ? (
          <Text color="secondary">The circuit list is not available.</Text>
        ) : !list.data ? (
          <OrbStatus phase="searching" message="Loading circuits" />
        ) : (
          <div className="f1-grid">
            {rows.map(({ c, h, failed }) => (
              <Card key={c.slug} padding={3} variant="muted">
                <VStack gap={2}>
                  <HStack justify="between" align="center">
                    <Text weight="semibold">{c.name}</Text>
                    <Badge label={c.circuit_type} variant="neutral" />
                  </HStack>
                  {h ? (
                    <>
                      <Rate label="Safety car" value={h.summary.safety_car_rate} max={1} text={pct(h.summary.safety_car_rate)} />
                      <Rate label="Red flag" value={h.summary.red_flag_rate} max={1} text={pct(h.summary.red_flag_rate)} />
                      <Rate label="DNFs / race" value={dnf(h)} max={4} text={dnf(h).toFixed(1)} />
                      <Text color="secondary" className="f1-num">
                        {h.summary.races} races
                      </Text>
                    </>
                  ) : (
                    <Text color="secondary">{failed ? "No stored history." : "Loading"}</Text>
                  )}
                </VStack>
              </Card>
            ))}
          </div>
        )}
      </VStack>
    </Card>
  );
}
