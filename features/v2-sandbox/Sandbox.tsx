"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { line } from "d3-shape";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { DriverChip } from "@/components/v2/DriverChip";
import { LiveBadge } from "@/components/v2/LiveBadge";
import { OrbStatus } from "@/components/v2/OrbStatus";
import { Stat } from "@/components/v2/Stat";
import { v2Queries } from "@/Lib/api/v2/queries";
import { API_MODE } from "@/Lib/api/mode";
import { COMPOUND_COLOURS, SECTOR_COLOURS, TEAM_COLOURS, seriesFor } from "@/Lib/v2/palette";
import type { AssistantPhase } from "@/Lib/api/v2/payloads";

const SURFACES = ["body", "surface", "muted", "popover"] as const;

function Swatch({ name, colour }: { name: string; colour: string }) {
  return (
    <VStack gap={1} align="start">
      <svg width="72" height="40" role="img" aria-label={`${name} ${colour}`}>
        <rect width="72" height="40" rx="4" fill={colour} stroke="var(--color-border-emphasized)" />
      </svg>
      <Text>{name}</Text>
    </VStack>
  );
}

function TrackOutline() {
  const { data } = useQuery(v2Queries.trackMap(2024, 8));
  if (!data) return <Text color="secondary">Loading track</Text>;
  const { x, y, distance } = data.points;
  const xs = x.map((v) => v / 10);
  const ys = y.map((v) => -v / 10);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const pad = 80;
  const idx = xs.map((_, i) => i);
  const path = line<number>().x((i) => xs[i]).y((i) => ys[i])(idx) ?? "";
  return (
    <VStack gap={2}>
      <svg
        viewBox={`${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`}
        width="100%"
        style={{ maxWidth: 360 }}
        role="img"
        aria-label="Mock circuit outline with DRS zones dashed"
      >
        <path d={path} fill="none" stroke="var(--color-text-secondary)" strokeWidth={26} strokeLinejoin="round" />
        {data.drs_zones.map((z) => {
          const i0 = distance.findIndex((d) => d >= z.start_m);
          const i1 = distance.findIndex((d) => d >= z.end_m);
          const seg = line<number>().x((i) => xs[i]).y((i) => ys[i])(idx.slice(i0, i1 + 1));
          return <path key={z.start_m} d={seg ?? ""} fill="none" stroke="var(--color-text-primary)" strokeWidth={10} strokeDasharray="30 22" />;
        })}
      </svg>
      <Text color="secondary" className="f1-num">
        {data.meta.point_count} points, {data.corners.length} corners, {data.drs_zones.length} DRS zones ({API_MODE} API)
      </Text>
    </VStack>
  );
}

export function Sandbox() {
  const { resolvedTheme, setTheme } = useTheme();
  const [phase, setPhase] = useState<AssistantPhase | "idle">("searching");
  const series = seriesFor([
    { code: "NOR", team: "McLaren" },
    { code: "PIA", team: "McLaren" },
    { code: "VER", team: "Red Bull" },
    { code: "LEC", team: "Ferrari" },
  ]);

  return (
    <VStack gap={6} padding={6} style={{ maxWidth: 1040, margin: "0 auto", background: "var(--color-background-body)", minHeight: "100vh" }}>
      <HStack justify="between" align="center" wrap="wrap" gap={3}>
        <VStack gap={1}>
          <Heading level={1}>Design sandbox</Heading>
          <Text color="secondary">Tokens, type and the first v2 primitives. Not linked from the app.</Text>
        </VStack>
        <SegmentedControl label="Theme" value={resolvedTheme === "light" ? "light" : "dark"} onChange={setTheme}>
          <SegmentedControlItem value="dark" label="Dark" />
          <SegmentedControlItem value="light" label="Light" />
        </SegmentedControl>
      </HStack>

      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={2}>Surfaces</Heading>
          <HStack gap={4} wrap="wrap">
            {SURFACES.map((s) => (
              <Swatch key={s} name={s} colour={`var(--color-background-${s})`} />
            ))}
            <Swatch name="accent (F1 red)" colour="var(--color-accent)" />
            <Swatch name="text" colour="var(--color-text-primary)" />
            <Swatch name="text secondary" colour="var(--color-text-secondary)" />
          </HStack>
        </VStack>
      </Card>

      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={2}>Type</Heading>
          <Heading level={1}>Race hub 1:21.447</Heading>
          <Text className="f1-display" style={{ fontSize: "2rem" }}>
            Condensed display, tabular figures
          </Text>
          <HStack gap={6} wrap="wrap">
            <Stat value="2.31" caption="Chaos Index" />
            <Stat value="312" unit="km/h" caption="Top speed" />
            <Stat value="+0.184" unit="s" caption="Delta at T6" />
          </HStack>
          <Text className="f1-num">1:21.447 / 1:21.903 / 1:22.111 (digits keep their width, so columns line up)</Text>
          <Text color="secondary">Body text is Figtree at 14 px; secondary text for captions and axis labels.</Text>
        </VStack>
      </Card>

      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={2}>Actions and states</Heading>
          <HStack gap={3} wrap="wrap" align="center">
            <Button label="Ask the stewards" variant="primary" />
            <Button label="Compare drivers" variant="secondary" />
            <Button label="Reset zoom" variant="ghost" />
            <Badge label="Calibrated" variant="neutral" />
            <Badge label="Baseline fallback" variant="warning" />
            <LiveBadge />
          </HStack>
          <Text color="secondary">Red is reserved for the one primary action and live states. Everything else is sand and charcoal.</Text>
        </VStack>
      </Card>

      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={2}>Data colours</Heading>
          <HStack gap={4} wrap="wrap">
            {Object.entries(TEAM_COLOURS).map(([t, c]) => (
              <Swatch key={t} name={t} colour={c} />
            ))}
          </HStack>
          <HStack gap={4} wrap="wrap">
            {series.map((s) => (
              <DriverChip key={s.driver} code={s.driver} colour={s.colour} dashed={s.dash !== null} />
            ))}
          </HStack>
          <HStack gap={4} wrap="wrap">
            <Swatch name="fastest" colour={SECTOR_COLOURS.fastest} />
            <Swatch name="good" colour={SECTOR_COLOURS.good} />
            <Swatch name="slower" colour={SECTOR_COLOURS.slower} />
            {Object.entries(COMPOUND_COLOURS).map(([k, c]) => (
              <Swatch key={k} name={k.toLowerCase()} colour={c} />
            ))}
          </HStack>
        </VStack>
      </Card>

      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={2}>Agent status</Heading>
          <SegmentedControl label="Orb phase" value={phase} onChange={(v) => setPhase(v as AssistantPhase | "idle")}>
            {(["idle", "queued", "searching", "solving", "composing"] as const).map((p) => (
              <SegmentedControlItem key={p} value={p} label={p} />
            ))}
          </SegmentedControl>
          <OrbStatus phase={phase} message={phase === "idle" ? "Waiting for a question" : `Phase: ${phase}`} />
        </VStack>
      </Card>

      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={2}>Typed API client</Heading>
          <TrackOutline />
        </VStack>
      </Card>
    </VStack>
  );
}
