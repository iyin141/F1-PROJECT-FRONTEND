"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { line } from "d3-shape";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { OrbStatus } from "@/components/v2/OrbStatus";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { isPending } from "@/Lib/api/v2/client";
import { v2Queries } from "@/Lib/api/v2/queries";
import type { TrackMapResponse } from "@/Lib/api/v2/payloads";
import { TEAM_BY_CODE, seriesFor } from "@/Lib/v2/palette";

// three.js, react-three-fiber and drei live behind this dynamic import: a separate chunk, loaded only on this page and only when 3D is used.
const Scene = dynamic(() => import("./Scene"), { ssr: false, loading: () => <OrbStatus phase="searching" message="Loading the 3D scene" /> });

const DRIVERS = ["VER", "NOR", "LEC", "PIA", "HAM"];

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
/** "checking" on the server and first client render (no hydration mismatch), then the real answer. */
function useCapability(): "checking" | "full" | "poster" {
  return useSyncExternalStore(
    () => () => {},
    () => (window.matchMedia("(max-width: 767px)").matches || (navigator.hardwareConcurrency ?? 8) <= 4 || !webglAvailable() ? "poster" : "full"),
    () => "checking",
  );
}

/** Static fallback: the circuit from above, with a plain-language reason. Used on phones, low-power devices and without WebGL. */
function Poster({ geometry }: { geometry: TrackMapResponse }) {
  const d = useMemo(() => {
    const xs = geometry.points.x.map((v) => v / 10), ys = geometry.points.y.map((v) => -v / 10);
    return line<number>().x((i) => xs[i]).y((i) => ys[i])(xs.map((_, i) => i)) ?? "";
  }, [geometry]);
  const view = useMemo(() => {
    const xs = geometry.points.x.map((v) => v / 10), ys = geometry.points.y.map((v) => -v / 10), pad = 150;
    return `${Math.min(...xs) - pad} ${Math.min(...ys) - pad} ${Math.max(...xs) - Math.min(...xs) + 2 * pad} ${Math.max(...ys) - Math.min(...ys) + 2 * pad}`;
  }, [geometry]);
  return (
    <svg viewBox={view} width="100%" style={{ maxHeight: 360, display: "block" }} role="img" aria-label="Circuit from above (static preview)">
      <path d={d} fill="none" stroke="var(--color-border-emphasized)" strokeWidth={44} strokeLinejoin="round" />
      <path d={d} fill="none" stroke="var(--color-text-secondary)" strokeWidth={14} strokeLinejoin="round" />
    </svg>
  );
}

export function Replay3D({ year, round }: { year: number; round: number }) {
  const capability = useCapability();
  const reduced = usePrefersReducedMotion();
  const [force, setForce] = useState(false);
  const geometry = useQuery(v2Queries.trackMap(year, round));
  const sectorsQ = useQuery(v2Queries.miniSectors(year, round, DRIVERS));
  const series = useMemo(() => seriesFor(DRIVERS.map((code) => ({ code, team: TEAM_BY_CODE[code] }))), []);
  const sectors = sectorsQ.data && !isPending(sectorsQ.data) ? sectorsQ.data : undefined;
  const show3d = capability === "full" || force;

  return (
    <VStack gap={4} padding={4} style={{ maxWidth: 1200, margin: "0 auto" }}>
      <HStack justify="between" align="end" wrap="wrap" gap={2}>
        <VStack gap={0.5}>
          <Heading level={1}>3D replay</Heading>
          <Text color="secondary">{year} round {round}. Drag to orbit, scroll to zoom, or follow one driver.</Text>
        </VStack>
        <Link href={`/race/${year}/${round}`}>Back to the race hub</Link>
      </HStack>
      <Card padding={4}>
        {geometry.isError || sectorsQ.isError ? (
          <Text color="secondary">The circuit or lap data is not available for this race yet.</Text>
        ) : !geometry.data || !sectors || capability === "checking" ? (
          <OrbStatus phase="searching" message={sectorsQ.data && isPending(sectorsQ.data) ? "Building the circuit data for this race" : "Loading the circuit"} />
        ) : show3d ? (
          <Scene geometry={geometry.data} sectors={sectors} series={series} reducedMotion={reduced} />
        ) : (
          <VStack gap={3}>
            <Poster geometry={geometry.data} />
            <Text>The interactive 3D view is off on small screens, low-power devices and browsers without WebGL, so this page shows a still picture instead.</Text>
            <div><Button label="Load the 3D view anyway" variant="secondary" onClick={() => setForce(true)} /></div>
          </VStack>
        )}
      </Card>
    </VStack>
  );
}
