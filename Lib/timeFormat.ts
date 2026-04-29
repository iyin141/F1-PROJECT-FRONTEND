/**
 * Utilities for parsing pandas timedelta strings returned by the Django backend.
 *
 * The backend serialises timedelta values as:
 *   "0 days 00:01:32.456000"   ← lap time / sector time
 *   "0 days 00:00:23.456000"   ← pit stop duration
 *   "-1 days +23:59:58.766000" ← negative gap (rare)
 *
 * All functions return a safe fallback when input is null / undefined / unparseable.
 */

const TIMEDELTA_RE =
  /^(-?\d+)\s+days?\s+([+-]?\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/;

/**
 * Convert a pandas timedelta string to total seconds.
 * Returns null when the string cannot be parsed.
 */
export function toSeconds(value: string | null | undefined): number | null {
  if (!value) return null;

  const match = value.trim().match(TIMEDELTA_RE);
  if (!match) return null;

  const days = parseInt(match[1], 10);
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);
  const seconds = parseInt(match[4], 10);
  const microStr = match[5] ?? "0";
  const microseconds = parseInt(microStr.padEnd(6, "0").slice(0, 6), 10);

  const total =
    days * 86400 +
    hours * 3600 +
    minutes * 60 +
    seconds +
    microseconds / 1_000_000;

  return total;
}

/**
 * Format a pandas timedelta string as a lap/sector time string.
 *
 * Examples:
 *   "0 days 00:01:32.456000" → "1:32.456"
 *   "0 days 00:00:31.100000" → "31.100"   (< 1 minute — no leading "0:")
 *   null                     → "—"
 */
export function formatLapTime(value: string | null | undefined): string {
  const s = toSeconds(value);
  if (s === null) return "—";

  const absS = Math.abs(s);
  const sign = s < 0 ? "-" : "";

  const minutes = Math.floor(absS / 60);
  const remainingSeconds = absS - minutes * 60;
  const wholeSec = Math.floor(remainingSeconds);
  const millis = Math.round((remainingSeconds - wholeSec) * 1000);

  const secStr = String(wholeSec).padStart(2, "0");
  const msStr = String(millis).padStart(3, "0");

  if (minutes > 0) {
    return `${sign}${minutes}:${secStr}.${msStr}`;
  }

  // Under a minute — drop the leading "0:"
  const secNoZero = String(wholeSec);
  return `${sign}${secNoZero}.${msStr}`;
}

/**
 * Format a pandas timedelta string as a gap string (e.g. gap to leader).
 *
 * Examples:
 *   "0 days 00:00:01.234000"  → "+1.234s"
 *   "-1 days +23:59:58.766000" → "-1.234s"
 *   "0 days 00:00:00"          → "leader"
 *   null                       → "—"
 */
export function formatGap(value: string | null | undefined): string {
  const s = toSeconds(value);
  if (s === null) return "—";
  if (s === 0) return "leader";

  const abs = Math.abs(s);
  const sign = s < 0 ? "-" : "+";

  if (abs >= 60) {
    return `${sign}${formatLapTime(value)}`;
  }

  return `${sign}${abs.toFixed(3)}s`;
}
