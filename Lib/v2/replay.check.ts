// Run: node Lib/v2/replay.check.ts
import { distanceAt } from "./replay.ts";
import assert from "node:assert/strict";
const p = { driver: "VER", cum: [0, 10, 30], lapTime: 30, startDelay: 0 };
const b = [0, 100, 400];
assert.equal(distanceAt(p, b, 5).d, 50);
assert.equal(distanceAt(p, b, 20).d, 250);
assert.equal(distanceAt(p, b, 35).lap, 2);
assert.equal(distanceAt(p, b, 35).d, 50);
console.log("replay ok");
