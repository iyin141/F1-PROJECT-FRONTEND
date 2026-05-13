/**
 * Resolves the correct circuit SVG path for a given app circuit ID and race year.
 *
 * Priority:
 *   dark  mode -> detailed/white-outline -> minimal/white-outline
 *   light mode -> detailed/black-outline -> minimal/black-outline
 *
 * App circuit IDs differ from the circuits.json IDs, so a mapping table is used.
 * The circuits.json is parsed to find which layoutId was used for the given year.
 */

import CIRCUITS_DATA from "@/Lib/data/f1-circuits.json";

const DETAILED_LAYOUT_IDS = new Set([
  "austin-1", "bahrain-1", "baku-1", "catalunya-6", "hungaroring-3",
  "interlagos-2", "jeddah-1", "las-vegas-1", "lusail-1", "madring-1",
  "marina-bay-4", "melbourne-2", "mexico-city-3", "miami-1", "monaco-6",
  "montreal-6", "monza-7", "shanghai-1", "silverstone-8",
  "spa-francorchamps-4", "spielberg-3", "suzuka-2", "yas-marina-2",
  "zandvoort-5",
]);

function seasonIncludes(seasons: string, year: number): boolean {
  for (const part of seasons.split(",")) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [from, to] = trimmed.split("-").map(Number);
      if (year >= from && year <= to) return true;
    } else {
      if (Number(trimmed) === year) return true;
    }
  }
  return false;
}

type CircuitEntry = {
  id: string;
  layouts: Array<{ layoutId: string; seasons: string }>;
};

function getLayoutId(jsonCircuitId: string, year: number): {id : string , entry : any } | null {
  const entry = (CIRCUITS_DATA as CircuitEntry[]).find((c) => c.id === jsonCircuitId);
  if (!entry) return null;
  

  const match = entry.layouts.find((l) => seasonIncludes(l.seasons, year));
  
  if (match)
  {
    
    return { id: match.layoutId, entry };
  }
  
  return { id: entry.layouts[entry.layouts.length - 1]?.layoutId ?? null, entry };
}



export type CircuitTheme = "dark" | "light";

export function getCircuitSvgPathandciruitname(
  circuitId: string,
  year: number,
  theme: CircuitTheme,
): {url : string , entry : any } | null {
  const layoutId = getLayoutId(circuitId, year);
  if (!layoutId) return null;

  const style = theme === "dark" ? "white-outline" : "black-outline";

  if (DETAILED_LAYOUT_IDS.has(layoutId.id)) {
    return { url: `/circuits/detailed/${style}/${layoutId.id}.svg`, entry: layoutId.entry };
  }

  return { url: `/circuits/minimal/${style}/${layoutId.id}.svg`, entry: layoutId.entry };
}
