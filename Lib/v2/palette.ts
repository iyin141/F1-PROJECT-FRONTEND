/**
 * Colour data that canvas/SVG charts need as JS values. Interface colours live in the Astryx theme
 * (`styles/theme/f1Theme.ts`); CSS-only extras live in `styles/v2-tokens.css`.
 * Team colours: prefer the API's own; these are the fallbacks. F1 red is NOT a team colour here.
 */
export const TEAM_COLOURS: Record<string, string> = {
  "Red Bull": "#3671C6",
  McLaren: "#FF8000",
  Ferrari: "#E8002D",
  Mercedes: "#27F4D2",
  "Aston Martin": "#229971",
  Alpine: "#FF87BC",
  Williams: "#64C4FF",
  RB: "#6692FF",
  Haas: "#B6BABD",
  Sauber: "#52E252",
};

/** Accessible fallback when a team is unknown (colour-blind-safe Okabe-Ito subset). */
export const FALLBACK_SERIES = ["#56B4E9", "#E69F00", "#009E73", "#CC79A7", "#F0E442", "#0072B2"];

export const COMPOUND_COLOURS = { SOFT: "#E8002D", MEDIUM: "#FFD12E", HARD: "#EDEDED", INTERMEDIATE: "#39B54A", WET: "#2D7DFF" } as const;

/** Mini-sector timing colours: purple fastest, green personal best, yellow slower. */
export const SECTOR_COLOURS = { fastest: "#A855F7", good: "#22C55E", slower: "#EAB308" } as const;

export type Series = { driver: string; team?: string; colour: string; dash: number[] | null };

/**
 * One colour per driver from the team; the second driver of a team (or an unknown team that repeats a colour)
 * gets a dashed line so two teammates stay distinguishable without relying on colour alone.
 */
export function seriesFor(drivers: { code: string; team?: string; colour?: string }[]): Series[] {
  const seen = new Map<string, number>();
  return drivers.map((d, i) => {
    const colour = d.colour ?? (d.team ? TEAM_COLOURS[d.team] : undefined) ?? FALLBACK_SERIES[i % FALLBACK_SERIES.length];
    const n = seen.get(colour) ?? 0;
    seen.set(colour, n + 1);
    return { driver: d.code, team: d.team, colour, dash: n === 0 ? null : [6, 4] };
  });
}

/** Team by driver code (2024-25 grid) for when no API team is available, so teammates still share a colour and dash. */
export const TEAM_BY_CODE: Record<string, string> = {
  VER: "Red Bull", PER: "Red Bull", LAW: "Red Bull", TSU: "RB", RIC: "RB", NOR: "McLaren", PIA: "McLaren",
  LEC: "Ferrari", HAM: "Ferrari", SAI: "Williams", ALB: "Williams", COL: "Williams", RUS: "Mercedes", ANT: "Mercedes",
  ALO: "Aston Martin", STR: "Aston Martin", GAS: "Alpine", OCO: "Haas", HUL: "Sauber", BOT: "Sauber", ZHO: "Sauber", MAG: "Haas", BEA: "Haas",
};
