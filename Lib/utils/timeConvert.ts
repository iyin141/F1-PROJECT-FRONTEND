/**
 * Utilities for converting API timedelta / lap time strings into seconds
 * and formatting seconds back into human-readable lap/time strings.
 */

export function timeStringToSeconds(raw?: string | null): number | null {
  if (!raw) return null;
  const s = String(raw).trim();

  // Pattern: "0 days 00:01:37.123000" (timedelta-like)
  const daysMatch = s.match(/^(\d+)\s+days?\s+(.*)$/i);
  let rest = s;
  let days = 0;
  if (daysMatch) {
    days = Number(daysMatch[1]) || 0;
    rest = daysMatch[2];
  }

  // If rest looks like HH:MM:SS(.micro)
  if (/^\d{1,2}:\d{2}:\d{2}(?:\.\d+)?$/.test(rest)) {
    const parts = rest.split(":");
    const h = Number(parts[0]) || 0;
    const m = Number(parts[1]) || 0;
    const sec = Number(parts[2]) || 0;
    return days * 86400 + h * 3600 + m * 60 + sec;
  }

  // If rest looks like M:SS.mmm or MM:SS.mmm
  if (/^\d{1,2}:\d{2}(?:\.\d+)?$/.test(rest)) {
    const [mStr, sStr] = rest.split(":");
    const m = Number(mStr) || 0;
    const sec = Number(sStr) || 0;
    return days * 86400 + m * 60 + sec;
  }

  // Fallback: parse as float seconds
  const num = Number(rest);
  if (!Number.isFinite(num)) return null;
  return days * 86400 + num;
}

export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return "";
  const s = Math.abs(seconds);
  const mins = Math.floor(s / 60);
  const secs = s - mins * 60;
  const secsFixed = secs.toFixed(3);
  const [secsWhole, secsFrac] = secsFixed.split(".");
  const secsPad = secsWhole.padStart(2, "0");
  return `${mins}:${secsPad}.${secsFrac}`;
}

export function secondsToHMS(seconds: number | null | undefined, includeMs = true): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return "";
  const s = Math.abs(seconds);
  const hours = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  const ms = Math.round((s - Math.floor(s)) * 1000);
  const hh = String(hours).padStart(2, "0");
  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  if (includeMs) {
    return `${hh}:${mm}:${ss}.${String(ms).padStart(3, "0")}`;
  }
  return `${hh}:${mm}:${ss}`;
}

export function formatDelta(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return "";
  const sign = seconds > 0 ? "+" : seconds < 0 ? "-" : "";
  const abs = Math.abs(seconds);
  return `${sign}${abs.toFixed(3)}s`;
}

export default {
  timeStringToSeconds,
  formatLapTime,
  formatDelta,
};
