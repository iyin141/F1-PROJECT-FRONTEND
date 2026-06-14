export type TelemetrySample = {
  distance_m?: number;
  distance?: number;
  speed_kph?: number;
  speed?: number;
  [key: string]: any;
};

export function deriveCumulativeTime(samples: TelemetrySample[]): number[] {
  if (samples.length === 0) return [];
  
  const cumulativeTime: number[] = new Array(samples.length).fill(0);
  
  for (let i = 1; i < samples.length; i++) {
    const prevDist = samples[i-1].distance_m ?? samples[i-1].distance ?? 0;
    const currDist = samples[i].distance_m ?? samples[i].distance ?? 0;
    const dDist = currDist - prevDist;
    
    if (dDist <= 0) {
      console.error(`[lapTimeDerivation] Non-monotonic or zero distance increment detected at index ${i}: prev=${prevDist}, curr=${currDist}`);
      throw new Error(`Non-monotonic distance_m in telemetry samples.`);
    }

    const prevSpeed = samples[i-1].speed_kph ?? samples[i-1].speed ?? 0;
    const currSpeed = samples[i].speed_kph ?? samples[i].speed ?? 0;
    
    const avgSpeedKph = (currSpeed + prevSpeed) / 2;
    let avgSpeedMs = avgSpeedKph * (1000 / 3600);
    
    if (avgSpeedMs < 0.5) {
      avgSpeedMs = 0.5;
    }
    
    const dt = dDist / avgSpeedMs;
    cumulativeTime[i] = cumulativeTime[i-1] + dt;
  }

  for (let i = 0; i < cumulativeTime.length; i++) {
    if (Number.isNaN(cumulativeTime[i]) || !Number.isFinite(cumulativeTime[i])) {
      console.error(`[lapTimeDerivation] Invalid derived time at index ${i}:`, samples[i]);
      throw new Error(`Derived time at index ${i} is NaN or Infinity.`);
    }
  }

  const totalLapTime = cumulativeTime[cumulativeTime.length - 1];
  console.log(`[lapTimeDerivation] Final derived lap time: ${totalLapTime.toFixed(3)}s`);

  return cumulativeTime;
}
