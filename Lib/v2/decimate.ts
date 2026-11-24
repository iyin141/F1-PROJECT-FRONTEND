/**
 * Min/max per-pixel decimation for line charts. Keeps every spike: each bucket emits its minimum and maximum.
 * All series share one x array (buckets are cut on index), so uPlot can keep a single aligned x column; the
 * x of a bucket's two points are its first and last sample, a sub-pixel error when buckets are one pixel wide.
 * Returns the inputs unchanged when they already fit in `maxPoints`.
 */
export function decimate(x: ArrayLike<number>, ys: ArrayLike<number>[], maxPoints: number): { x: ArrayLike<number>; ys: ArrayLike<number>[] } {
  const n = x.length;
  const buckets = Math.floor(maxPoints / 2);
  if (n <= maxPoints || buckets < 1) return { x, ys };
  const ox = new Float64Array(buckets * 2);
  const oys = ys.map(() => new Float64Array(buckets * 2));
  for (let b = 0; b < buckets; b++) {
    const i0 = Math.floor((b * n) / buckets);
    const i1 = Math.max(i0 + 1, Math.floor(((b + 1) * n) / buckets));
    ox[2 * b] = x[i0];
    ox[2 * b + 1] = x[i1 - 1];
    ys.forEach((y, k) => {
      let lo = Infinity, hi = -Infinity;
      for (let i = i0; i < i1; i++) {
        const v = y[i];
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
      const empty = lo === Infinity; // all NaN
      oys[k][2 * b] = empty ? NaN : lo;
      oys[k][2 * b + 1] = empty ? NaN : hi;
    });
  }
  return { x: ox, ys: oys };
}

/** Linear resample of (xs, ys) onto `target` x values. Used when drivers' distance grids differ. */
export function resample(xs: ArrayLike<number>, ys: ArrayLike<number>, target: ArrayLike<number>): Float64Array {
  const out = new Float64Array(target.length);
  let j = 0;
  for (let i = 0; i < target.length; i++) {
    const t = target[i];
    while (j < xs.length - 2 && xs[j + 1] < t) j++;
    const span = xs[j + 1] - xs[j] || 1;
    const f = Math.min(1, Math.max(0, (t - xs[j]) / span));
    out[i] = ys[j] + f * (ys[j + 1] - ys[j]);
  }
  return out;
}
