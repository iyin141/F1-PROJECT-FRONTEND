"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { DriverChip } from "@/components/v2/DriverChip";
import type { MiniSectorsResponse, TrackMapResponse } from "@/Lib/api/v2/payloads";
import { distanceAt, pointAt, profilesFrom, track3d, type Profile, type Track3D } from "@/Lib/v2/replay";
import type { Series } from "@/Lib/v2/palette";

const LAPS = 3;
const SPEEDS = [1, 2, 4, 8, 16] as const;
const ROAD_HALF = 0.16; // 16 m each side of the centre line, in world units (1 unit = 100 m)
const KERB_WIDTH = 0.07;

type Playback = { t: number; playing: boolean; speed: number; max: number; follow: string | null; reduced: boolean; onTick: (t: number, laps: Record<string, number>) => void };

/** Triangle-strip ribbon along the centre line between lateral offsets [inner, outer] (negative = left). Colours per point. */
function ribbon(tr: Track3D, inner: number, outer: number, colourAt: (i: number) => THREE.Color) {
  const n = tr.n;
  const pos = new Float32Array(n * 2 * 3), col = new Float32Array(n * 2 * 3);
  const idx: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
    const tx = tr.pts[3 * b] - tr.pts[3 * a], tz = tr.pts[3 * b + 2] - tr.pts[3 * a + 2];
    const len = Math.hypot(tx, tz) || 1;
    const nx = -tz / len, nz = tx / len;
    const c = colourAt(i);
    for (let s = 0; s < 2; s++) {
      const off = s === 0 ? inner : outer;
      const o = 3 * (2 * i + s);
      pos[o] = tr.pts[3 * i] + nx * off;
      pos[o + 1] = tr.pts[3 * i + 1];
      pos[o + 2] = tr.pts[3 * i + 2] + nz * off;
      col[o] = c.r; col[o + 1] = c.g; col[o + 2] = c.b;
    }
    if (i < n - 1) { const k = 2 * i; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function Circuit({ tr, bounds, sectorColour }: { tr: Track3D; bounds: number[]; sectorColour: (sector: number) => string }) {
  const { road, kerbL, kerbR } = useMemo(() => {
    const sectorOf = (i: number) => { const d = tr.dist[i]; let s = 0; while (s < bounds.length - 2 && bounds[s + 1] <= d) s++; return s; };
    const asphalt = new THREE.Color("#2b2d33");
    const kc = (i: number) => new THREE.Color(sectorColour(sectorOf(i)));
    return {
      road: ribbon(tr, -ROAD_HALF, ROAD_HALF, () => asphalt),
      kerbL: ribbon(tr, -ROAD_HALF - KERB_WIDTH, -ROAD_HALF, kc),
      kerbR: ribbon(tr, ROAD_HALF, ROAD_HALF + KERB_WIDTH, kc),
    };
  }, [tr, bounds, sectorColour]);
  return (
    <group>
      <mesh geometry={road}><meshBasicMaterial vertexColors side={THREE.DoubleSide} /></mesh>
      <mesh geometry={kerbL}><meshBasicMaterial vertexColors side={THREE.DoubleSide} /></mesh>
      <mesh geometry={kerbR}><meshBasicMaterial vertexColors side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

/** Advances the playback clock by one frame; kept outside the component so the frame loop only calls it. */
function stepClock(p: Playback, delta: number) {
  if (!p.playing) return;
  p.t += delta * p.speed;
  if (p.t > p.max) p.t = 0;
}

/** Cars and the follow camera. Everything per frame is imperative: no React state changes while playing. */
function Cars({ tr, bounds, profiles, series, pb }: { tr: Track3D; bounds: number[]; profiles: Profile[]; series: Series[]; pb: React.MutableRefObject<Playback> }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const frame = useRef(0);
  const tmp = useRef<[number, number, number]>([0, 0, 0]);
  const tmp2 = useRef<[number, number, number]>([0, 0, 0]);
  const goal = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const p = pb.current;
    stepClock(p, delta);
    const laps: Record<string, number> = {};
    profiles.forEach((pr, i) => {
      const { d, lap } = distanceAt(pr, bounds, p.t);
      laps[pr.driver] = Math.min(LAPS, lap);
      const [x, y, z] = pointAt(tr, d, tmp.current);
      refs.current[i]?.position.set(x, y + 0.09, z);
    });
    if (p.follow) {
      const i = profiles.findIndex((pr) => pr.driver === p.follow);
      if (i >= 0) {
        const { d } = distanceAt(profiles[i], bounds, p.t);
        const [x, y, z] = pointAt(tr, d, tmp.current);
        const [ax, ay, az] = pointAt(tr, d + 40, tmp2.current); // 40 m ahead gives the heading
        const hx = ax - x, hz = az - z, hl = Math.hypot(hx, hz) || 1;
        goal.current.set(x - (hx / hl) * 0.9, y + 0.55, z - (hz / hl) * 0.9);
        if (p.reduced) state.camera.position.copy(goal.current); else state.camera.position.lerp(goal.current, 0.12);
        state.camera.lookAt(x, y + 0.1, z);
      }
    }
    if (frame.current++ % 6 === 0) p.onTick(p.t, laps);
  });

  return (
    <>
      {profiles.map((pr, i) => (
        <mesh key={pr.driver} ref={(m) => { refs.current[i] = m; }}>
          <sphereGeometry args={[0.16, 20, 14]} />
          <meshBasicMaterial color={series.find((s) => s.driver === pr.driver)?.colour ?? "#ffffff"} />
        </mesh>
      ))}
    </>
  );
}

const fmt = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;

type Props = { geometry: TrackMapResponse; sectors: MiniSectorsResponse; series: Series[]; reducedMotion: boolean };

/** The WebGL scene and its controls. Imported lazily by Replay3D so three.js never reaches other pages. */
export default function Scene({ geometry, sectors, series, reducedMotion }: Props) {
  const tr = useMemo(() => track3d(geometry), [geometry]);
  const bounds = geometry.mini_sectors.boundaries;
  const profiles = useMemo(() => profilesFrom(sectors, series.map((s) => s.driver)), [sectors, series]);
  const max = LAPS * Math.max(...profiles.map((p) => p.lapTime));

  const [playing, setPlaying] = useState(!reducedMotion); // reduced motion: paused until the viewer presses Play
  const [speed, setSpeed] = useState<number>(1);
  const [camera, setCamera] = useState<"orbit" | "follow">("orbit");
  const [followDriver, setFollowDriver] = useState(series[0]?.driver ?? "");

  const slider = useRef<HTMLInputElement>(null);
  const clock = useRef<HTMLOutputElement>(null);
  const lapsEl = useRef<HTMLOutputElement>(null);
  const onTick = useCallback((t: number, laps: Record<string, number>) => {
    if (slider.current) slider.current.value = String(t);
    if (clock.current) clock.current.textContent = fmt(t);
    if (lapsEl.current) lapsEl.current.textContent = Object.entries(laps).map(([d, l]) => `${d} lap ${l}`).join(", ");
  }, []);
  const pb = useRef<Playback>({ t: 0, playing, speed, max, follow: null, reduced: reducedMotion, onTick });
  useEffect(() => {
    pb.current.playing = playing;
    pb.current.speed = speed;
    pb.current.max = max;
    pb.current.follow = camera === "follow" ? followDriver : null;
  }, [playing, speed, max, camera, followDriver]);

  const fastest = sectors.fastest_per_sector;
  const sectorColour = useCallback((s: number) => {
    const w = fastest.find((f) => f.sector === s + 1)?.driver;
    return series.find((x) => x.driver === w)?.colour ?? "#8a8a8a";
  }, [fastest, series]);

  return (
    <VStack gap={3}>
      <div style={{ height: "min(62vh, 560px)", borderRadius: 8, overflow: "hidden", background: "var(--color-background-surface)" }}>
        <Canvas camera={{ position: [0, 38, 38], fov: 45, near: 0.1, far: 400 }} dpr={[1, 1.75]} aria-label="3D circuit with cars">
          <color attach="background" args={["#15161A"]} />
          <Circuit tr={tr} bounds={bounds} sectorColour={sectorColour} />
          <Cars tr={tr} bounds={bounds} profiles={profiles} series={series} pb={pb} />
          <OrbitControls enabled={camera === "orbit"} enableDamping={!reducedMotion} maxPolarAngle={Math.PI / 2.05} />
        </Canvas>
      </div>

      <HStack gap={3} wrap="wrap" align="center">
        <Button label={playing ? "Pause" : "Play"} variant="primary" onClick={() => setPlaying((p) => !p)} />
        <SegmentedControl label="Speed" value={String(speed)} onChange={(v) => setSpeed(Number(v))} size="sm">
          {SPEEDS.map((s) => <SegmentedControlItem key={s} value={String(s)} label={`${s}x`} />)}
        </SegmentedControl>
        <SegmentedControl label="Camera" value={camera} onChange={(v) => setCamera(v as "orbit" | "follow")} size="sm">
          <SegmentedControlItem value="orbit" label="Orbit" />
          <SegmentedControlItem value="follow" label="Follow driver" />
        </SegmentedControl>
        {camera === "follow" ? (
          <select className="f1-select" aria-label="Driver to follow" value={followDriver} onChange={(e) => setFollowDriver(e.target.value)}>
            {series.map((s) => <option key={s.driver} value={s.driver}>{s.driver}</option>)}
          </select>
        ) : null}
      </HStack>

      <HStack gap={3} align="center">
        <output ref={clock} className="f1-num" style={{ minWidth: 56 }}>0:00.0</output>
        <input
          ref={slider}
          type="range" min={0} max={max} step={0.1} defaultValue={0} aria-label="Replay position"
          style={{ flex: 1 }}
          onInput={(e) => { pb.current.t = Number((e.target as HTMLInputElement).value); onTick(pb.current.t, {}); }}
        />
        <Text color="secondary" className="f1-num">{fmt(max)}</Text>
      </HStack>

      <HStack gap={4} wrap="wrap" align="center" justify="between">
        <HStack gap={4} wrap="wrap">{series.map((s) => <DriverChip key={s.driver} code={s.driver} colour={s.colour} dashed={s.dash !== null} />)}</HStack>
        <output ref={lapsEl} className="f1-num" aria-live="off" style={{ color: "var(--color-text-secondary)" }} />
      </HStack>
      <Text color="secondary">
        Kerbs take the colour of the fastest driver in each mini-sector. Elevation is exaggerated 3 times. Positions follow each driver&apos;s fastest-lap pace, repeated for {LAPS} laps.
      </Text>
    </VStack>
  );
}
