"use client";

import { useTheme } from "next-themes";

/** Theme-aware colours for canvas/ECharts: data-ink first, gridlines at 8% opacity. */
export function useChartColours() {
  const dark = useTheme().resolvedTheme !== "light";
  return {
    dark,
    ink: dark ? "#ECE6DA" : "#1A1A1C",
    muted: dark ? "#B3ACA0" : "#5A554B",
    grid: dark ? "rgba(236,230,218,0.08)" : "rgba(26,26,28,0.08)",
  };
}
