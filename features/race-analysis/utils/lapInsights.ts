export type TracePoint = {
  distance: number;
  time: number;
  brake: boolean;
  speed: number;
  throttle?: number;
};

export type GridPoint = {
  distance: number;
  delta: number;
  speedA: number;
  speedB: number;
  throttleA?: number;
  throttleB?: number;
  brakeA: boolean;
  brakeB: boolean;
  brakeA_mapped: number;
  brakeB_mapped: number;
  timeA: number;
  timeB: number;
};

export type SectorSummary = {
  start: number;
  end: number;
  time: number;
  topSpeedA?: number;
  topSpeedB?: number;
};

// Rounding helpers
const roundT = (v: number) => v.toFixed(1);
const roundS = (v: number) => Math.round(v);
const roundD = (v: number) => Math.round(v / 10) * 10;

export function getGapInsights(grid: GridPoint[], tFinalA: number, tFinalB: number, driverA: string, driverB: string) {
  const insights: string[] = [];
  if (!grid.length) return { finalGap: null, largestSwing: null, leadChanges: null };

  const gap = tFinalB - tFinalA;
  const winner = gap > 0 ? driverA : driverB;
  const loser = gap > 0 ? driverB : driverA;
  insights.push(`${loser} finished the lap ${Math.abs(gap).toFixed(3)}s slower than ${winner}.`);

  let maxSwing = 0;
  let maxSwingStart = 0;
  let maxSwingEnd = 0;
  let maxSwingVal = 0;

  for (let i = 0; i < grid.length; i++) {
    const startP = grid[i];
    for (let j = i + 1; j < grid.length; j++) {
      const endP = grid[j];
      if (endP.distance - startP.distance > 100) break;
      const swing = endP.delta - startP.delta;
      if (Math.abs(swing) > maxSwing) {
        maxSwing = Math.abs(swing);
        maxSwingVal = swing;
        maxSwingStart = startP.distance;
        maxSwingEnd = endP.distance;
      }
    }
  }

  let largestSwing: string | null = null;
  if (maxSwing > 0.01) {
    const swingLoser = maxSwingVal > 0 ? driverB : driverA;
    largestSwing = `${swingLoser} lost the most ground between ${roundD(maxSwingStart)}m and ${roundD(maxSwingEnd)}m (+${maxSwing.toFixed(3)}s in that stretch).`;
  }

  let zeroCrossings = 0;
  let firstCrossingDist = 0;
  for (let i = 1; i < grid.length; i++) {
    if ((grid[i - 1].delta > 0 && grid[i].delta <= 0) || (grid[i - 1].delta < 0 && grid[i].delta >= 0)) {
      if (zeroCrossings === 0) firstCrossingDist = grid[i].distance;
      zeroCrossings++;
    }
  }

  let leadChanges: string | null = null;
  if (zeroCrossings > 0) {
    const initialLeader = grid[0].delta > 0 ? driverA : driverB;
    const newLeader = initialLeader === driverA ? driverB : driverA;
    leadChanges = `${initialLeader} was ahead for the first ${roundD(firstCrossingDist)}m before ${newLeader} took over at ${roundD(firstCrossingDist)}m.`;
  }

  return {
    finalGap: `${loser} finished the lap ${Math.abs(gap).toFixed(3)}s slower than ${winner}.`,
    largestSwing,
    leadChanges
  };
}

export function getSectorInsights(sectorsA: SectorSummary[], sectorsB: SectorSummary[], driverA: string, driverB: string) {
  let maxSectorDelta = -1;
  let maxSectorIdx = -1;

  const perSector = sectorsA.map((sA, i) => {
    const sB = sectorsB[i];
    const timeA = sA.time;
    const timeB = sB.time;
    const delta = timeB - timeA;
    const absDelta = Math.abs(delta);

    if (absDelta > maxSectorDelta && timeA > 0 && timeB > 0) {
      maxSectorDelta = absDelta;
      maxSectorIdx = i;
    }

    const fasterDriver = delta > 0 ? driverA : driverB;
    
    let leadStr: string | null = null;
    if (absDelta >= 0.05) {
      leadStr = `Sector ${i + 1}: ${fasterDriver} was ${roundT(absDelta)}s quicker.`;
    }

    let speedStr: string | null = null;
    const tsA = sA.topSpeedA ?? 0;
    const tsB = sB.topSpeedB ?? 0;
    const higherSpeed = Math.max(tsA, tsB);
    const lowerSpeed = Math.min(tsA, tsB);
    const fasterSpeedDriver = tsA > tsB ? driverA : driverB;
    if (higherSpeed - lowerSpeed >= 3 && higherSpeed > 0) {
      speedStr = `${fasterSpeedDriver} also carried a higher top speed through Sector ${i + 1} (${roundS(higherSpeed)} km/h vs ${roundS(lowerSpeed)} km/h).`;
    }

    return { leadStr, speedStr };
  });

  let summaryLine: string | null = null;
  if (maxSectorIdx >= 0) {
    const sA = sectorsA[maxSectorIdx];
    const sB = sectorsB[maxSectorIdx];
    const fasterDriver = (sB.time - sA.time) > 0 ? driverA : driverB;
    const loser = fasterDriver === driverA ? driverB : driverA;
    summaryLine = `${loser}'s lap was decided mainly in Sector ${maxSectorIdx + 1}, where ${fasterDriver} gained ${roundT(maxSectorDelta)}s.`;
  }

  return { summaryLine, perSector };
}

export function getInputTraceInsights(traceA: TracePoint[], traceB: TracePoint[], shownTrace: "A" | "B", driverA: string, driverB: string) {
  if (!traceA.length || !traceB.length) return { speedCompare: null, brakingInfo: null };

  const topA = Math.max(...traceA.map(t => t.speed));
  const topB = Math.max(...traceB.map(t => t.speed));
  
  const fasterDriver = topA > topB ? driverA : driverB;
  const higher = Math.max(topA, topB);
  const lower = Math.min(topA, topB);
  const speedCompare = `${fasterDriver} reached a higher top speed on this lap (${roundS(higher)} km/h vs ${roundS(lower)} km/h, +${roundS(higher - lower)} km/h).`;

  const trace = shownTrace === "A" ? traceA : traceB;
  const shownDriver = shownTrace === "A" ? driverA : driverB;
  
  let brakeCount = 0;
  let maxBrakeLen = 0;
  let maxBrakeStart = 0;

  let inBrake = false;
  let currentBrakeStart = 0;

  for (let i = 0; i < trace.length; i++) {
    if (trace[i].brake && !inBrake) {
      inBrake = true;
      brakeCount++;
      currentBrakeStart = trace[i].distance;
    } else if (!trace[i].brake && inBrake) {
      inBrake = false;
      const len = trace[i - 1].distance - currentBrakeStart;
      if (len > maxBrakeLen) {
        maxBrakeLen = len;
        maxBrakeStart = currentBrakeStart;
      }
    }
  }
  // handle if ends while braking
  if (inBrake) {
    const len = trace[trace.length - 1].distance - currentBrakeStart;
    if (len > maxBrakeLen) {
      maxBrakeLen = len;
      maxBrakeStart = currentBrakeStart;
    }
  }

  let brakingInfo: string | null = null;
  if (brakeCount > 0) {
    const countStr = brakeCount === 1 ? "once" : `${brakeCount} times`;
    brakingInfo = `${shownDriver} braked ${countStr} on this lap. The heaviest braking zone started around ${roundD(maxBrakeStart)}m and lasted ${roundD(maxBrakeLen)}m.`;
  }

  return { speedCompare, brakingInfo };
}
