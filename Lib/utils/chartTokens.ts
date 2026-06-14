/**
 * Helpers to resolve CSS design tokens for chart colours at render time.
 * Uses getComputedStyle(document.documentElement).getPropertyValue(...).
 */

export function getCssToken(name: string): string {
  if (typeof window === "undefined" || !name) return "";
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  } catch (e) {
    return "";
  }
}

export const TYRE_TOKEN_MAP: Record<string, string> = {
  soft: "--tyre-soft",
  medium: "--tyre-medium",
  hard: "--tyre-hard",
  inter: "--tyre-inter",
  wet: "--tyre-wet",
};

export function tyreToken(compound: string): string {
  if (!compound) return "";
  const key = String(compound).toLowerCase();
  const tokenName = TYRE_TOKEN_MAP[key] ?? `--tyre-${key}`;
  return getCssToken(tokenName);
}

export function teamToken(teamNameOrSlug: string): string {
  if (!teamNameOrSlug) return "";
  const slug = String(teamNameOrSlug).toLowerCase().replace(/\s+/g, "-");
  return getCssToken(`--team-${slug}`);
}

export function posToken(pos: string | number): string {
  if (pos === undefined || pos === null) return "";
  const key = typeof pos === "number" ? `--pos-p${pos}` : `--pos-${String(pos).toLowerCase()}`;
  return getCssToken(key);
}

export default {
  getCssToken,
  tyreToken,
  teamToken,
  posToken,
};
