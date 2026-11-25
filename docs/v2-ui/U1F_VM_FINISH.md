# Finish the 3D replay (U1f) on the VM

Branch `v2/ui-3d` holds the written 3D replay code (HEAD at the time of writing). It was never type-checked, built or run, because `npm install` of three.js, react-three-fiber and drei fails on the original dev PC (corrupted registry responses). Do the steps below on the VM, from a checkout of `v2/ui-3d`.

## 1. Install the packages (exact pins)
```bash
npm ci   # restores everything already in package-lock.json
npm install --save-exact --legacy-peer-deps \
  three@0.187.0 @react-three/fiber@9.8.2 @react-three/drei@10.7.9 @types/three@0.187.0
```
Why `--legacy-peer-deps`: react-three-fiber lists `expo-gl` as an optional peer, and npm's resolver then reports `ERESOLVE ... react-dom@undefined`. The flag skips that optional-peer check; React 19.2.4 and three 0.187 satisfy the real peers (`react >=19 <19.4`, `three >=0.156`; drei wants `react ^19`, `three >=0.159`, `@react-three/fiber ^9`).

Alternative without a flag on every install: add this to `package.json` and run `npm install` normally.
```json
"overrides": { "expo-gl": { "react-dom": "$react-dom" } }
```
Use one of the two, not both. If the install touches existing locked versions (check `git diff --stat package-lock.json`), review before committing; only the new packages and their dependencies should be added.

Network note: if registry downloads corrupt again on the VM, `npm cache verify` and retry; do not use a third-party mirror.

## 2. If drei still will not install
drei is used only for `OrbitControls` in `features/replay3d/Scene.tsx`. Drop it:
```bash
npm install --save-exact --legacy-peer-deps three@0.187.0 @react-three/fiber@9.8.2 @types/three@0.187.0
```
and in `Scene.tsx` replace the drei import with a small component using three's own controls:
```tsx
import { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

function Orbit({ enabled, damping }: { enabled: boolean; damping: boolean }) {
  const { camera, gl } = useThree();
  useEffect(() => {
    const c = new OrbitControlsImpl(camera, gl.domElement);
    c.enabled = enabled; c.enableDamping = damping; c.maxPolarAngle = Math.PI / 2.05;
    const id = setInterval(() => c.update(), 16); // damping needs update(); r3f frame loop is fine too
    return () => { clearInterval(id); c.dispose(); };
  }, [camera, gl, enabled, damping]);
  return null;
}
```
then use `<Orbit enabled={camera === "orbit"} damping={!reducedMotion} />`. Remove `@react-three/drei` from the install line.

## 3. Checks
```bash
npx tsc --noEmit
npm run lint
NEXT_PUBLIC_API_MODE=mock npm run build
```
Expect: no type errors (the 3D files have never been compiled; fix anything r3f 9 or three 0.187 typings flag), 0 lint errors.

Confirm the 3D chunk is separate: after the build, three should appear only in chunks used by `/race/[year]/[round]/3d`.
```bash
grep -l "WebGLRenderer" .next/static/chunks/*.js        # lists the chunk(s) holding three.js
grep -L "WebGLRenderer" .next/static/chunks/*.js | wc -l # all other chunks
```
Then check the other pages do not reference that chunk: open `.next/server/app/(v2)/race/[year]/[round]/page_client-reference-manifest.js` and `.../chaos/page_client-reference-manifest.js` and confirm the three.js chunk file name is absent. (With `next/dynamic` and `ssr: false` it loads only from the 3d page.)

## 4. Run it and take a WebGL screenshot
```bash
NEXT_PUBLIC_API_MODE=mock npx next start -p 3010
```
Open `http://localhost:3010/race/2024/8/3d` in a browser with WebGL. Headless Chromium needs software GL: with Playwright use `chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] })`. The page shows the poster instead of the scene when `hardwareConcurrency <= 4`, the window is under 768 px, or WebGL is missing; the "Load the 3D view anyway" button forces it. Save screenshots (desktop, and the 375 px poster) to `docs/v2-ui/screens/`. Check by eye: ribbon with elevation, kerbs coloured by mini-sector, five coloured spheres moving, Play/Pause, 1/2/4/8/16x, scrub, Follow driver camera. Under `prefers-reduced-motion: reduce` it must start paused.

## 5. Merge into `v2/ui`
```bash
git checkout v2/ui
git merge --no-ff v2/ui-3d -m "Merge the 3D replay (U1f)"
```
`v2/ui-3d` branched from `v2/ui` at the last pre-U1f commit, so conflicts are limited to `docs/v2-ui/PROGRESS.md`, `package.json`, `package-lock.json`, `tsconfig.json` and `features/race-hub/RaceHub.tsx` (the "3D replay" link). Re-run step 3 after the merge. Delete the "(code written, NOT built or tested)" wording in PROGRESS.md when it is verified.
