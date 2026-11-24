// Run: node Lib/v2/decimate.check.ts   (Node 22.18+ strips types; no test runner needed)
import { decimate, resample } from "./decimate.ts";
import assert from "node:assert/strict";

const n = 100_000;
const x = Float64Array.from({ length: n }, (_, i) => i);
const y = Float64Array.from({ length: n }, (_, i) => (i === 54_321 ? 999 : Math.sin(i / 100)));
const d = decimate(x, [y], 2000);
assert.equal(d.x.length, 2000);
assert.equal(Math.max(...d.ys[0]), 999, "a one-sample spike must survive decimation");
assert.equal(decimate(x, [y], n).x, x, "no-op when it already fits");
assert.deepEqual([...resample([0, 10], [0, 100], [0, 5, 10])], [0, 50, 100]);
console.log("decimate ok");
