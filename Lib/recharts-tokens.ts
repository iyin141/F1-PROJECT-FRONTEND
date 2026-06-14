/**
 * Runtime helpers to resolve CSS token variables to colours for Recharts.
 * Provides an SSR-safe fallback map when `getComputedStyle` is unavailable.
 */

const FALLBACK_TOKENS: Record<string, string> = {
  "--tyre-soft": "#FF6D00",
  "--tyre-medium": "#FFEA00",
  "--tyre-hard": "#F2F2F2",
  "--tyre-inter": "#00A86B",
  "--tyre-wet": "#1E90FF",
  "--pos-p1": "#FFD700",
  "--pos-p2": "#C0C0C0",
  "--pos-p3": "#CD7F32",
  "--muted": "#666666",
};

export function getTokenColor(tokenName: string): string {
  // Try DOM resolution when running in the browser
  try {
    if (typeof window !== "undefined" && typeof getComputedStyle === "function") {
      const v = getComputedStyle(document.documentElement).getPropertyValue(tokenName);
      if (v && v.trim()) return v.trim();
    }
  } catch (e) {
    // fall through to fallback map
  }
  return FALLBACK_TOKENS[tokenName] ?? FALLBACK_TOKENS["--muted"];
}

export function resolveTyreColor(compound: "soft" | "medium" | "hard" | "inter" | "wet") {
  return getTokenColor(`--tyre-${compound}`);
}

export function resolvePosColor(place: number) {
  if (place === 1) return getTokenColor("--pos-p1");
  if (place === 2) return getTokenColor("--pos-p2");
  if (place === 3) return getTokenColor("--pos-p3");
  return getTokenColor("--muted");
}

export const TYRE_COMPOUNDS = ["soft", "medium", "hard", "inter", "wet"] as const;
export type TyreCompound = typeof TYRE_COMPOUNDS[number];
