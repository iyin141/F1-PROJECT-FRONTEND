export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }) =>
  new Date(iso).toLocaleDateString("en-GB", opts);

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export const formatLapMs = (ms: number) => {
  const m = Math.floor(ms / 60000);
  const s = ((ms % 60000) / 1000).toFixed(3);
  return `${m}:${s.padStart(6, "0")}`;
};

export const formatGap = (ms: number) => `+${(ms / 1000).toFixed(3)}`;

import type { AnalysisSessionCode, AnalysisSessionName } from "@/types/api";

/** Maps AnalysisSessionName (including long-form aliases) to the short API session code. */
export function toSessionCode(session: AnalysisSessionName): AnalysisSessionCode {
  if (session === "Race") return "R";
  if (session === "Qualifying") return "Q";
  return session;
}

/** Maps the display session names used in AnalysisPanels to API session codes. */
export const normalizeSession = (
  session: "RACE" | "QUALIFYING" | "FP1" | "FP2" | "FP3",
): "R" | "Q" | "FP1" | "FP2" | "FP3" => {
  if (session === "RACE") return "R";
  if (session === "QUALIFYING") return "Q";
  return session;
};

export const countdownTo = (iso: string) => {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms % 86400000) / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000),
    seconds: Math.floor((ms % 60000) / 1000),
    past: false,
  };
}
